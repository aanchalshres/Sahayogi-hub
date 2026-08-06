<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\NgoProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $organizations = [
            [
                'user' => [
                    'name'  => 'Maiti Nepal',
                    'email' => 'info@maitinepal.org',
                    'phone' => '9771-4492915',
                ],
                'profile' => [
                    'organization_name'   => 'Maiti Nepal',
                    'registration_number' => 'NGO-NP-1993-001',
                    'description'         => 'Maiti Nepal is a non-profit organization dedicated to protecting Nepali women and children from trafficking, sexual exploitation, and domestic violence. Founded by Anuradha Koirala, it provides rehabilitation, legal aid, and empowerment programs.',
                    'mission'             => 'To protect and empower women and children from trafficking and exploitation.',
                    'vision'              => 'A Nepal free from human trafficking and gender-based violence.',
                    'website'             => 'https://www.maitinepal.org',
                    'office_location'     => 'Gaushala, Kathmandu',
                    'city'                => 'Kathmandu',
                    'country'             => 'Nepal',
                    'latitude'            => 27.7120,
                    'longitude'           => 85.3450,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Room to Read Nepal',
                    'email' => 'nepal@roomtoread.org',
                    'phone' => '9771-5523455',
                ],
                'profile' => [
                    'organization_name'   => 'Room to Read Nepal',
                    'registration_number' => 'NGO-NP-2000-045',
                    'description'         => 'Room to Read seeks to transform the lives of millions of children in low-income communities by focusing on literacy and gender equality in education. In Nepal, it has established libraries, published local-language children\'s books, and supported girls\' education.',
                    'mission'             => 'To create a world free from illiteracy and gender inequality.',
                    'vision'              => 'Every child deserves access to quality education and the opportunity to reach their full potential.',
                    'website'             => 'https://www.roomtoread.org',
                    'office_location'     => 'Sanepa, Lalitpur',
                    'city'                => 'Lalitpur',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6830,
                    'longitude'           => 85.3080,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Possible Health',
                    'email' => 'info@possiblehealth.org',
                    'phone' => '9771-4411503',
                ],
                'profile' => [
                    'organization_name'   => 'Possible Health (Nyaya Health Nepal)',
                    'registration_number' => 'NGO-NP-2008-102',
                    'description'         => 'Possible Health delivers high-quality healthcare to the poorest communities in rural Nepal. Operating the Bayalpata Hospital in Achham, it serves as a model for accountable, technology-driven healthcare delivery in low-resource settings.',
                    'mission'             => 'To deliver high-quality healthcare in the most impoverished communities.',
                    'vision'              => 'Healthcare as a human right for every Nepali.',
                    'website'             => 'https://www.possiblehealth.org',
                    'office_location'     => 'Achham, Sudurpashchim Province',
                    'city'                => 'Achham',
                    'country'             => 'Nepal',
                    'latitude'            => 29.0400,
                    'longitude'           => 81.2500,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'ECCA Nepal',
                    'email' => 'info@eccanepal.org',
                    'phone' => '9771-5534621',
                ],
                'profile' => [
                    'organization_name'   => 'Environment and Child Care Alliance Nepal (ECCA)',
                    'registration_number' => 'NGO-NP-2005-078',
                    'description'         => 'ECCA Nepal works on environmental conservation and child welfare. It implements programs for clean water, waste management, reforestation, and child education in underserved communities across Nepal.',
                    'mission'             => 'To promote environmental sustainability and child welfare in Nepal.',
                    'vision'              => 'A clean, green Nepal where every child thrives.',
                    'website'             => 'https://www.eccanepal.org',
                    'office_location'     => 'Chabahil, Kathmandu',
                    'city'                => 'Kathmandu',
                    'country'             => 'Nepal',
                    'latitude'            => 27.7180,
                    'longitude'           => 85.3490,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Nepal Red Cross Society',
                    'email' => 'info@nrcs.org',
                    'phone' => '9771-4270650',
                ],
                'profile' => [
                    'organization_name'   => 'Nepal Red Cross Society',
                    'registration_number' => 'NGO-NP-1963-003',
                    'description'         => 'Nepal Red Cross Society is a leading humanitarian organization providing disaster response, health services, blood transfusion, and community resilience programs throughout Nepal. It is part of the International Red Cross and Red Crescent Movement.',
                    'mission'             => 'To prevent and alleviate human suffering through volunteer service.',
                    'vision'              => 'A resilient Nepal where every person receives humanitarian assistance in times of need.',
                    'website'             => 'https://www.nrcs.org',
                    'office_location'     => 'Red Cross Marg, Kalimati, Kathmandu',
                    'city'                => 'Kathmandu',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6960,
                    'longitude'           => 85.2990,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Teach For Nepal',
                    'email' => 'info@teachfornepal.org',
                    'phone' => '9771-5550234',
                ],
                'profile' => [
                    'organization_name'   => 'Teach For Nepal',
                    'registration_number' => 'NGO-NP-2012-189',
                    'description'         => 'Teach For Nepal recruits and trains outstanding university graduates and young professionals to teach in under-resourced public schools for two years. The fellowship develops leaders committed to ending educational inequity in Nepal.',
                    'mission'             => 'To end educational inequity by building a movement of leaders.',
                    'vision'              => 'One day, all children in Nepal will have the opportunity to attain an excellent education.',
                    'website'             => 'https://www.teachfornepal.org',
                    'office_location'     => 'Jhamsikhel, Lalitpur',
                    'city'                => 'Lalitpur',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6770,
                    'longitude'           => 85.3150,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Karuna Foundation Nepal',
                    'email' => 'info@karunafoundation.org.np',
                    'phone' => '9771-5521645',
                ],
                'profile' => [
                    'organization_name'   => 'Karuna Foundation Nepal',
                    'registration_number' => 'NGO-NP-2007-095',
                    'description'         => 'Karuna Foundation Nepal focuses on disability prevention and inclusive community development. It works in partnership with local governments to build inclusive municipalities where people with disabilities have equal access to services and opportunities.',
                    'mission'             => 'To build inclusive societies where people with disabilities are valued and included.',
                    'vision'              => 'An inclusive Nepal where no one is left behind due to disability.',
                    'website'             => 'https://www.karunafoundation.org.np',
                    'office_location'     => 'Pulchowk, Lalitpur',
                    'city'                => 'Lalitpur',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6780,
                    'longitude'           => 85.3190,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'WWF Nepal',
                    'email' => 'info@wwfnepal.org',
                    'phone' => '9771-4434820',
                ],
                'profile' => [
                    'organization_name'   => 'World Wildlife Fund Nepal (WWF Nepal)',
                    'registration_number' => 'NGO-NP-1993-012',
                    'description'         => 'WWF Nepal works to conserve Nepal\'s rich biodiversity — from the snow leopards of the Himalayas to the one-horned rhinos of the Terai. It focuses on wildlife conservation, climate adaptation, sustainable livelihoods, and forest management.',
                    'mission'             => 'To conserve nature and reduce the most pressing threats to the diversity of life on Earth.',
                    'vision'              => 'A Nepal where people and nature thrive together.',
                    'website'             => 'https://www.wwfnepal.org',
                    'office_location'     => 'Baluwatar, Kathmandu',
                    'city'                => 'Kathmandu',
                    'country'             => 'Nepal',
                    'latitude'            => 27.7260,
                    'longitude'           => 85.3290,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Dhulikhel Hospital',
                    'email' => 'info@dhulikhelhospital.org',
                    'phone' => '011-490497',
                ],
                'profile' => [
                    'organization_name'   => 'Dhulikhel Hospital (Kathmandu University Hospital)',
                    'registration_number' => 'NGO-NP-1996-034',
                    'description'         => 'Dhulikhel Hospital is a not-for-profit community hospital providing affordable and quality healthcare services. It operates outreach clinics in remote areas, trains healthcare professionals, and runs community health programs across Nepal.',
                    'mission'             => 'To provide equitable and quality healthcare accessible to all Nepalis, especially the underserved.',
                    'vision'              => 'A healthy Nepal through community-based healthcare excellence.',
                    'website'             => 'https://www.dhulikhelhospital.org',
                    'office_location'     => 'Dhulikhel, Kavrepalanchok',
                    'city'                => 'Dhulikhel',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6220,
                    'longitude'           => 85.5560,
                    'verification_status' => 'verified',
                ],
            ],
            [
                'user' => [
                    'name'  => 'WOREC Nepal',
                    'email' => 'info@worecnepal.org',
                    'phone' => '9771-4478656',
                ],
                'profile' => [
                    'organization_name'   => 'Women\'s Rehabilitation Centre Nepal (WOREC)',
                    'registration_number' => 'NGO-NP-1991-008',
                    'description'         => 'WOREC Nepal is a national-level women\'s rights organization working on issues of gender-based violence, safe migration, reproductive health, and women\'s economic empowerment. It runs community-level awareness campaigns and survivor support programs.',
                    'mission'             => 'To promote and protect women\'s human rights through advocacy, empowerment, and service delivery.',
                    'vision'              => 'A just society where women and marginalized groups enjoy their full human rights.',
                    'website'             => 'https://www.worecnepal.org',
                    'office_location'     => 'Balkumari, Lalitpur',
                    'city'                => 'Lalitpur',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6680,
                    'longitude'           => 85.3340,
                    'verification_status' => 'verified',
                ],
            ],
        ];

        foreach ($organizations as $org) {
            $user = User::firstOrCreate(
                ['email' => $org['user']['email']],
                [
                    'name'     => $org['user']['name'],
                    'phone'    => $org['user']['phone'],
                    'password' => Hash::make('password'),
                    'role'     => 'ngo',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            NgoProfile::firstOrCreate(
                ['user_id' => $user->id],
                $org['profile']
            );
        }

        $this->command?->info('Top 10 organizations seeded successfully.');
    }
}
