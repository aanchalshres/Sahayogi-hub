<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VolunteerProfile;
use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class VolunteerProfileSeeder extends Seeder
{
    public function run(): void
    {
        $skillsByName = Skill::pluck('id', 'name');

        $volunteers = [
            [
                'user' => [
                    'name'  => 'Aarav Sharma',
                    'email' => 'aarav.sharma@example.com',
                    'phone' => '9841000001',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1995-04-12',
                    'bio' => 'Experienced paramedic and emergency first responder with 5+ years in community health drives.',
                    'primary_location' => 'Thamel, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.7152,
                    'longitude' => 85.3123,
                    'emergency_contact_name' => 'Ram Sharma',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.92,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.95, 'completion' => 0.95, 'ratings' => 0.90,
                        'verification' => 1.00, 'response' => 0.90, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 140.50,
                    'average_rating' => 4.85,
                ],
                'skills' => [
                    'First Aid' => 'expert',
                    'CPR' => 'expert',
                    'Triage' => 'expert',
                    'Disaster Response' => 'intermediate',
                    'Communication' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Sita Adhikari',
                    'email' => 'sita.adhikari@example.com',
                    'phone' => '9841000002',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '1998-08-25',
                    'bio' => 'Passionate secondary school mathematics teacher advocating for STEM education in rural schools.',
                    'primary_location' => 'Lakeside, Pokhara',
                    'city' => 'Pokhara',
                    'country' => 'Nepal',
                    'latitude' => 28.2096,
                    'longitude' => 83.9595,
                    'emergency_contact_name' => 'Hari Adhikari',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.88,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.90, 'completion' => 0.90, 'ratings' => 0.85,
                        'verification' => 0.80, 'response' => 0.85, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 95.00,
                    'average_rating' => 4.70,
                ],
                'skills' => [
                    'Teaching' => 'expert',
                    'Tutoring' => 'expert',
                    'Curriculum Development' => 'intermediate',
                    'Communication' => 'expert',
                    'Teamwork' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Bikash Shrestha',
                    'email' => 'bikash.shrestha@example.com',
                    'phone' => '9841000003',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1993-01-15',
                    'bio' => 'Full-stack software developer building open-source tech for local non-profit organizations.',
                    'primary_location' => 'Patan, Lalitpur',
                    'city' => 'Lalitpur',
                    'country' => 'Nepal',
                    'latitude' => 27.6765,
                    'longitude' => 85.3250,
                    'emergency_contact_name' => 'Maya Shrestha',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.85,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.85, 'completion' => 0.85, 'ratings' => 0.90,
                        'verification' => 0.80, 'response' => 0.80, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 72.00,
                    'average_rating' => 4.60,
                ],
                'skills' => [
                    'Web Development' => 'expert',
                    'IT Support' => 'expert',
                    'Database Management' => 'intermediate',
                    'Mobile App Development' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Pooja Thapa',
                    'email' => 'pooja.thapa@example.com',
                    'phone' => '9841000004',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '2000-06-30',
                    'bio' => 'Environmental science student passionate about urban forestry, recycling, and climate activism.',
                    'primary_location' => 'Baluwatar, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.7250,
                    'longitude' => 85.3310,
                    'emergency_contact_name' => 'Kiran Thapa',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.78,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.80, 'completion' => 0.75, 'ratings' => 0.80,
                        'verification' => 0.70, 'response' => 0.80, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 48.00,
                    'average_rating' => 4.40,
                ],
                'skills' => [
                    'Environmental Conservation' => 'expert',
                    'Reforestation' => 'intermediate',
                    'Waste Management' => 'intermediate',
                    'Community Outreach' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Rohan Gurung',
                    'email' => 'rohan.gurung@example.com',
                    'phone' => '9841000005',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1991-11-05',
                    'bio' => 'Disaster recovery specialist certified in search and rescue operations during earthquakes and floods.',
                    'primary_location' => 'Main Road, Biratnagar',
                    'city' => 'Biratnagar',
                    'country' => 'Nepal',
                    'latitude' => 26.4525,
                    'longitude' => 87.2718,
                    'emergency_contact_name' => 'Suman Gurung',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.95,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.98, 'completion' => 0.95, 'ratings' => 0.95,
                        'verification' => 1.00, 'response' => 0.90, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 210.00,
                    'average_rating' => 4.95,
                ],
                'skills' => [
                    'Disaster Response' => 'expert',
                    'Search and Rescue' => 'expert',
                    'First Aid' => 'expert',
                    'Logistics' => 'intermediate',
                    'Leadership' => 'expert',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Anita Rai',
                    'email' => 'anita.rai@example.com',
                    'phone' => '9841000006',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '1997-03-18',
                    'bio' => 'Veterinary assistant devoted to stray animal welfare, rescue, vaccination, and sterilization camps.',
                    'primary_location' => 'Bhanugupt Chowk, Dharan',
                    'city' => 'Dharan',
                    'country' => 'Nepal',
                    'latitude' => 26.8126,
                    'longitude' => 87.2831,
                    'emergency_contact_name' => 'Prem Rai',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.81,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.85, 'completion' => 0.80, 'ratings' => 0.80,
                        'verification' => 0.80, 'response' => 0.75, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 64.00,
                    'average_rating' => 4.50,
                ],
                'skills' => [
                    'Animal Care' => 'expert',
                    'Veterinary Support' => 'intermediate',
                    'Community Outreach' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Nirajan Tamang',
                    'email' => 'nirajan.tamang@example.com',
                    'phone' => '9841000007',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1994-09-09',
                    'bio' => 'Supply chain officer experienced in inventory control, food relief logistics, and transport fleet coordination.',
                    'primary_location' => 'Narayangarh, Bharatpur',
                    'city' => 'Bharatpur',
                    'country' => 'Nepal',
                    'latitude' => 27.6833,
                    'longitude' => 84.4333,
                    'emergency_contact_name' => 'Dawa Tamang',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.86,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.90, 'completion' => 0.85, 'ratings' => 0.85,
                        'verification' => 0.85, 'response' => 0.80, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 112.00,
                    'average_rating' => 4.65,
                ],
                'skills' => [
                    'Logistics' => 'expert',
                    'Inventory Management' => 'expert',
                    'Driving' => 'expert',
                    'Project Management' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Kriti Maharjan',
                    'email' => 'kriti.maharjan@example.com',
                    'phone' => '9841000008',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '1996-12-01',
                    'bio' => 'Mental health counselor providing psychological first aid and trauma support for marginalized groups.',
                    'primary_location' => 'Kupondole, Lalitpur',
                    'city' => 'Lalitpur',
                    'country' => 'Nepal',
                    'latitude' => 27.6870,
                    'longitude' => 85.3175,
                    'emergency_contact_name' => 'Sunil Maharjan',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.90,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.92, 'completion' => 0.90, 'ratings' => 0.92,
                        'verification' => 0.90, 'response' => 0.85, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 135.00,
                    'average_rating' => 4.88,
                ],
                'skills' => [
                    'Counselling' => 'expert',
                    'Mental Health Support' => 'expert',
                    'Psychological First Aid' => 'expert',
                    'Communication' => 'expert',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Dipendra Giri',
                    'email' => 'dipendra.giri@example.com',
                    'phone' => '9841000009',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1990-02-14',
                    'bio' => 'Civil engineer helping build earthquake-resistant shelters and public sanitation facilities in rural villages.',
                    'primary_location' => 'Traffic Chowk, Butwal',
                    'city' => 'Butwal',
                    'country' => 'Nepal',
                    'latitude' => 27.7006,
                    'longitude' => 83.4484,
                    'emergency_contact_name' => 'Ganesh Giri',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.84,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.85, 'completion' => 0.85, 'ratings' => 0.85,
                        'verification' => 0.80, 'response' => 0.80, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 88.00,
                    'average_rating' => 4.55,
                ],
                'skills' => [
                    'Construction' => 'expert',
                    'Civil Engineering' => 'expert',
                    'Project Management' => 'intermediate',
                    'Teamwork' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Prashant Karki',
                    'email' => 'prashant.karki@example.com',
                    'phone' => '9841000010',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1999-07-20',
                    'bio' => 'Documentary photographer covering humanitarian causes, community stories, and relief campaign media.',
                    'primary_location' => 'Baneshwor, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.6915,
                    'longitude' => 85.3420,
                    'emergency_contact_name' => 'Deepak Karki',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.76,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.78, 'completion' => 0.75, 'ratings' => 0.80,
                        'verification' => 0.70, 'response' => 0.75, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 40.00,
                    'average_rating' => 4.35,
                ],
                'skills' => [
                    'Photography' => 'expert',
                    'Videography' => 'intermediate',
                    'Social Media Management' => 'intermediate',
                    'Content Writing' => 'beginner',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Sabina Pandey',
                    'email' => 'sabina.pandey@example.com',
                    'phone' => '9841000011',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '1996-05-10',
                    'bio' => 'Public health nurse specializing in maternal and child health awareness programs across Province 2.',
                    'primary_location' => 'Adarsh Nagar, Birgunj',
                    'city' => 'Birgunj',
                    'country' => 'Nepal',
                    'latitude' => 27.0000,
                    'longitude' => 84.8667,
                    'emergency_contact_name' => 'Laxman Pandey',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.89,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.90, 'completion' => 0.90, 'ratings' => 0.90,
                        'verification' => 0.85, 'response' => 0.85, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 120.00,
                    'average_rating' => 4.75,
                ],
                'skills' => [
                    'Healthcare' => 'expert',
                    'First Aid' => 'expert',
                    'Health Education' => 'expert',
                    'Community Outreach' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Manish Chaudhary',
                    'email' => 'manish.chaudhary@example.com',
                    'phone' => '9841000012',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1997-10-14',
                    'bio' => 'Youth volunteer coordinator focused on sports, youth empowerment, and anti-drug awareness drives.',
                    'primary_location' => 'Dhamboji Chowk, Nepalgunj',
                    'city' => 'Nepalgunj',
                    'country' => 'Nepal',
                    'latitude' => 28.0500,
                    'longitude' => 81.6167,
                    'emergency_contact_name' => 'Rajesh Chaudhary',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.82,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.85, 'completion' => 0.80, 'ratings' => 0.85,
                        'verification' => 0.75, 'response' => 0.80, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 68.00,
                    'average_rating' => 4.45,
                ],
                'skills' => [
                    'Youth Empowerment' => 'expert',
                    'Event Coordination' => 'expert',
                    'Leadership' => 'intermediate',
                    'Public Speaking' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Sunita Joshi',
                    'email' => 'sunita.joshi@example.com',
                    'phone' => '9841000013',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '1992-04-03',
                    'bio' => 'Organic farming practitioner training local farmers in sustainable agricultural methods and soil health.',
                    'primary_location' => 'Kantipath, Hetauda',
                    'city' => 'Hetauda',
                    'country' => 'Nepal',
                    'latitude' => 27.4289,
                    'longitude' => 85.0322,
                    'emergency_contact_name' => 'Bishnu Joshi',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.79,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.80, 'completion' => 0.80, 'ratings' => 0.80,
                        'verification' => 0.75, 'response' => 0.75, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 55.00,
                    'average_rating' => 4.38,
                ],
                'skills' => [
                    'Agriculture' => 'expert',
                    'Farming Support' => 'expert',
                    'Environmental Conservation' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Ramesh Bhattarai',
                    'email' => 'ramesh.bhattarai@example.com',
                    'phone' => '9841000014',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1988-08-30',
                    'bio' => 'Senior accountant offering financial literacy workshops and audit assistance to small community co-ops.',
                    'primary_location' => 'Koteshwor, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.6788,
                    'longitude' => 85.3485,
                    'emergency_contact_name' => 'Madhav Bhattarai',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Busy',
                    'is_profile_complete' => true,
                    'trust_score' => 0.73,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.75, 'completion' => 0.75, 'ratings' => 0.75,
                        'verification' => 0.70, 'response' => 0.65, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 38.00,
                    'average_rating' => 4.25,
                ],
                'skills' => [
                    'Accounting' => 'expert',
                    'Financial Management' => 'expert',
                    'Data Entry' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Rashmi Neupane',
                    'email' => 'rashmi.neupane@example.com',
                    'phone' => '9841000015',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '2001-01-19',
                    'bio' => 'University student volunteering in food distribution drives and community kitchen management.',
                    'primary_location' => 'Kalanki, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.6938,
                    'longitude' => 85.2811,
                    'emergency_contact_name' => 'Prakash Neupane',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.70,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.70, 'completion' => 0.70, 'ratings' => 0.75,
                        'verification' => 0.65, 'response' => 0.70, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 30.00,
                    'average_rating' => 4.20,
                ],
                'skills' => [
                    'Food Distribution' => 'expert',
                    'Cooking' => 'intermediate',
                    'Community Service' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Kamal Khadka',
                    'email' => 'kamal.khadka@example.com',
                    'phone' => '9841000016',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1995-11-11',
                    'bio' => 'Active blood donor organizer and emergency transport driver during medical crises.',
                    'primary_location' => 'Chabahil, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.7170,
                    'longitude' => 85.3478,
                    'emergency_contact_name' => 'Bhim Khadka',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => true,
                    'trust_score' => 0.65,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.65, 'completion' => 0.65, 'ratings' => 0.70,
                        'verification' => 0.60, 'response' => 0.65, 'penalties' => 0.05
                    ],
                    'total_service_hours' => 24.00,
                    'average_rating' => 4.10,
                ],
                'skills' => [
                    'Blood Donation Drive' => 'expert',
                    'Driving' => 'expert',
                    'First Aid' => 'beginner',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Sujan Pradhan',
                    'email' => 'sujan.pradhan@example.com',
                    'phone' => '9841000017',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1994-07-07',
                    'bio' => 'Former youth leader with mixed attendance record working to improve reliability.',
                    'primary_location' => 'Prithvi Chowk, Pokhara',
                    'city' => 'Pokhara',
                    'country' => 'Nepal',
                    'latitude' => 28.2100,
                    'longitude' => 83.9850,
                    'emergency_contact_name' => 'Anil Pradhan',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Busy',
                    'is_profile_complete' => true,
                    'trust_score' => 0.45,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.40, 'completion' => 0.45, 'ratings' => 0.50,
                        'verification' => 0.50, 'response' => 0.50, 'penalties' => 0.15
                    ],
                    'total_service_hours' => 18.00,
                    'average_rating' => 3.50,
                ],
                'skills' => [
                    'Event Planning' => 'intermediate',
                    'Communication' => 'intermediate',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Bandana Devkota',
                    'email' => 'bandana.devkota@example.com',
                    'phone' => '9841000018',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '2002-09-22',
                    'bio' => 'New volunteer interested in child care, tutoring, and literacy programs.',
                    'primary_location' => 'Maharajgunj, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.7340,
                    'longitude' => 85.3325,
                    'emergency_contact_name' => 'Nabin Devkota',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => false,
                    'trust_score' => 0.50,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.50, 'completion' => 0.50, 'ratings' => 0.50,
                        'verification' => 0.30, 'response' => 0.50, 'penalties' => 0.00
                    ],
                    'total_service_hours' => 0.00,
                    'average_rating' => 0.00,
                ],
                'skills' => [
                    'Tutoring' => 'beginner',
                    'Child Care' => 'beginner',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Ganesh Thangaraj',
                    'email' => 'ganesh.thangaraj@example.com',
                    'phone' => '9841000019',
                ],
                'profile' => [
                    'gender' => 'Male',
                    'date_of_birth' => '1991-03-29',
                    'bio' => 'Volunteer with history of cancellations and low responsiveness.',
                    'primary_location' => 'Sanepa, Lalitpur',
                    'city' => 'Lalitpur',
                    'country' => 'Nepal',
                    'latitude' => 27.6820,
                    'longitude' => 85.3070,
                    'emergency_contact_name' => 'Vijay Thangaraj',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Unavailable',
                    'is_profile_complete' => true,
                    'trust_score' => 0.25,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.20, 'completion' => 0.25, 'ratings' => 0.30,
                        'verification' => 0.50, 'response' => 0.20, 'penalties' => 0.35
                    ],
                    'total_service_hours' => 10.00,
                    'average_rating' => 2.80,
                ],
                'skills' => [
                    'IT Support' => 'intermediate',
                    'Data Entry' => 'beginner',
                ],
            ],
            [
                'user' => [
                    'name'  => 'Rina Shrestha',
                    'email' => 'rina.shrestha@example.com',
                    'phone' => '9841000020',
                ],
                'profile' => [
                    'gender' => 'Female',
                    'date_of_birth' => '1999-12-12',
                    'bio' => 'Unverified profile with frequent no-shows.',
                    'primary_location' => 'Gongabu, Kathmandu',
                    'city' => 'Kathmandu',
                    'country' => 'Nepal',
                    'latitude' => 27.7330,
                    'longitude' => 85.3120,
                    'emergency_contact_name' => 'Shiva Shrestha',
                    'emergency_contact_phone' => '9841000000',
                    'availability' => 'Available',
                    'is_profile_complete' => false,
                    'trust_score' => 0.15,
                    'trust_updated_at' => now(),
                    'trust_score_components' => [
                        'attendance' => 0.10, 'completion' => 0.10, 'ratings' => 0.20,
                        'verification' => 0.10, 'response' => 0.10, 'penalties' => 0.45
                    ],
                    'total_service_hours' => 4.00,
                    'average_rating' => 2.10,
                ],
                'skills' => [
                    'Community Service' => 'beginner',
                ],
            ],
        ];

        foreach ($volunteers as $vData) {
            $user = User::firstOrCreate(
                ['email' => $vData['user']['email']],
                [
                    'name'              => $vData['user']['name'],
                    'phone'             => $vData['user']['phone'],
                    'password'          => Hash::make('password'),
                    'role'              => 'volunteer',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]
            );

            $profileData = array_merge(['user_id' => $user->id], $vData['profile']);

            $profile = VolunteerProfile::updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            // Sync skills with proficiency levels
            $skillSync = [];
            foreach ($vData['skills'] as $skillName => $proficiency) {
                if (isset($skillsByName[$skillName])) {
                    $skillSync[$skillsByName[$skillName]] = ['proficiency_level' => $proficiency];
                }
            }
            if (!empty($skillSync)) {
                $profile->skills()->sync($skillSync);
            }
        }

        $this->command?->info('VolunteerProfileSeeder executed successfully: 20 volunteers seeded.');
    }
}
