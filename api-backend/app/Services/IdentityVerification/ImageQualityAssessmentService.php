<?php

namespace App\Services\IdentityVerification;

class ImageQualityAssessmentService
{
    public function assess(string $imagePath): array
    {
        $fullPath = $this->resolvePath($imagePath);

        if (!$fullPath || !file_exists($fullPath)) {
            return [
                'score' => 0,
                'resolution_score' => 0,
                'brightness_score' => 0,
                'contrast_score' => 0,
                'blur_score' => 0,
                'errors' => ['Image not found'],
            ];
        }

        $imageInfo = @getimagesize($fullPath);
        if (!$imageInfo) {
            return [
                'score' => 0,
                'resolution_score' => 0,
                'brightness_score' => 0,
                'contrast_score' => 0,
                'blur_score' => 0,
                'errors' => ['Cannot read image metadata'],
            ];
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $fileSize = filesize($fullPath);
        $isPdf = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION)) === 'pdf';

        $resolutionScore = $this->assessResolution($width, $height, $isPdf);
        $brightnessScore = $this->assessBrightness($fullPath, $width, $height);
        $contrastScore = $this->assessContrast($fullPath, $width, $height);
        $blurScore = $this->assessBlur($fullPath, $width, $height, $fileSize);

        $overallScore = round(
            $resolutionScore * 0.30 +
            $brightnessScore * 0.25 +
            $contrastScore * 0.20 +
            $blurScore * 0.25,
            2
        );

        return [
            'score' => $overallScore,
            'resolution_score' => $resolutionScore,
            'brightness_score' => $brightnessScore,
            'contrast_score' => $contrastScore,
            'blur_score' => $blurScore,
            'image_width' => $width,
            'image_height' => $height,
            'file_size' => $fileSize,
            'is_pdf' => $isPdf,
            'errors' => [],
        ];
    }

    private function assessResolution(int $width, int $height, bool $isPdf): float
    {
        if ($isPdf) {
            return 80;
        }

        $minDim = min($width, $height);
        $maxDim = max($width, $height);
        $aspectRatio = $maxDim / max($minDim, 1);

        $dimScore = match (true) {
            $minDim >= 2000 => 100,
            $minDim >= 1200 => 85,
            $minDim >= 800 => 70,
            $minDim >= 600 => 50,
            $minDim >= 400 => 30,
            default => 10,
        };

        $ratioScore = match (true) {
            $aspectRatio <= 1.5 => 100,
            $aspectRatio <= 2.0 => 85,
            $aspectRatio <= 3.0 => 60,
            default => 30,
        };

        return round($dimScore * 0.7 + $ratioScore * 0.3, 2);
    }

    private function assessBrightness(string $fullPath, int $width, int $height): float
    {
        $image = $this->createImage($fullPath);
        if (!$image) {
            return 50;
        }

        $sampleWidth = min($width, 200);
        $sampleHeight = min($height, 200);
        $resampled = imagecreatetruecolor($sampleWidth, $sampleHeight);
        imagecopyresampled($resampled, $image, 0, 0, 0, 0, $sampleWidth, $sampleHeight, $width, $height);

        $totalBrightness = 0;
        $pixelCount = $sampleWidth * $sampleHeight;

        for ($x = 0; $x < $sampleWidth; $x++) {
            for ($y = 0; $y < $sampleHeight; $y++) {
                $rgb = imagecolorat($resampled, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $totalBrightness += (0.299 * $r + 0.587 * $g + 0.114 * $b);
            }
        }

        imagedestroy($resampled);
        imagedestroy($image);

        $avgBrightness = $totalBrightness / $pixelCount;

        return match (true) {
            $avgBrightness >= 100 && $avgBrightness <= 220 => 100,
            $avgBrightness >= 80 && $avgBrightness <= 235 => 80,
            $avgBrightness >= 60 && $avgBrightness <= 245 => 50,
            default => 20,
        };
    }

    private function assessContrast(string $fullPath, int $width, int $height): float
    {
        $image = $this->createImage($fullPath);
        if (!$image) {
            return 50;
        }

        $sampleWidth = min($width, 200);
        $sampleHeight = min($height, 200);
        $resampled = imagecreatetruecolor($sampleWidth, $sampleHeight);
        imagecopyresampled($resampled, $image, 0, 0, 0, 0, $sampleWidth, $sampleHeight, $width, $height);

        $grayValues = [];
        for ($x = 0; $x < $sampleWidth; $x++) {
            for ($y = 0; $y < $sampleHeight; $y++) {
                $rgb = imagecolorat($resampled, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $grayValues[] = (0.299 * $r + 0.587 * $g + 0.114 * $b);
            }
        }

        imagedestroy($resampled);
        imagedestroy($image);

        $mean = array_sum($grayValues) / count($grayValues);
        $variance = 0;
        foreach ($grayValues as $val) {
            $variance += ($val - $mean) ** 2;
        }
        $variance /= count($grayValues);
        $stdDev = sqrt($variance);

        return match (true) {
            $stdDev >= 60 => 100,
            $stdDev >= 40 => 80,
            $stdDev >= 25 => 60,
            $stdDev >= 15 => 40,
            default => 20,
        };
    }

    private function assessBlur(string $fullPath, int $width, int $height, int $fileSize): float
    {
        $image = $this->createImage($fullPath);
        if (!$image) {
            $sizeScore = match (true) {
                $fileSize > 500000 => 80,
                $fileSize > 100000 => 60,
                $fileSize > 30000 => 40,
                default => 20,
            };
            return $sizeScore;
        }

        $sampleWidth = min($width, 150);
        $sampleHeight = min($height, 150);
        $resampled = imagecreatetruecolor($sampleWidth, $sampleHeight);
        imagecopyresampled($resampled, $image, 0, 0, 0, 0, $sampleWidth, $sampleHeight, $width, $height);

        $grayMatrix = [];
        for ($x = 0; $x < $sampleWidth; $x++) {
            for ($y = 0; $y < $sampleHeight; $y++) {
                $rgb = imagecolorat($resampled, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $grayMatrix[$y][$x] = (0.299 * $r + 0.587 * $g + 0.114 * $b);
            }
        }

        imagedestroy($resampled);
        imagedestroy($image);

        $laplacianVariance = $this->laplacianVariance($grayMatrix, $sampleWidth, $sampleHeight);

        return match (true) {
            $laplacianVariance > 100 => 100,
            $laplacianVariance > 60 => 85,
            $laplacianVariance > 30 => 60,
            $laplacianVariance > 15 => 40,
            $laplacianVariance > 5 => 20,
            default => 10,
        };
    }

    private function laplacianVariance(array $matrix, int $width, int $height): float
    {
        $kernel = [
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0],
        ];

        $responses = [];
        for ($y = 1; $y < $height - 1; $y++) {
            for ($x = 1; $x < $width - 1; $x++) {
                $val = 0;
                for ($ky = -1; $ky <= 1; $ky++) {
                    for ($kx = -1; $kx <= 1; $kx++) {
                        $val += $matrix[$y + $ky][$x + $kx] * $kernel[$ky + 1][$kx + 1];
                    }
                }
                $responses[] = $val;
            }
        }

        if (empty($responses)) {
            return 0;
        }

        $mean = array_sum($responses) / count($responses);
        $variance = 0;
        foreach ($responses as $val) {
            $variance += ($val - $mean) ** 2;
        }

        return $variance / count($responses);
    }

    private function createImage(string $path)
    {
        $info = @getimagesize($path);
        if (!$info) {
            return null;
        }

        return match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => @imagecreatefromwebp($path),
            default => null,
        };
    }

    private function resolvePath(string $path): ?string
    {
        if (file_exists($path)) {
            return $path;
        }
        $storagePath = storage_path("app/public/{$path}");
        if (file_exists($storagePath)) {
            return $storagePath;
        }
        $publicPath = public_path("storage/{$path}");
        if (file_exists($publicPath)) {
            return $publicPath;
        }
        return null;
    }
}
