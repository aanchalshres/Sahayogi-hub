<?php
return [
	'paths' => ['api/*', 'sanctum/csrf-cookie'],
	'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	'allowed_origins' => ['http://localhost:3000'],
	'allowed_origins_patterns' => [],
	'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
	'exposed_headers' => ['X-Total-Count', 'X-Page'],
	'max_age' => 86400,
	'supports_credentials' => true,
];
