<?php

use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $db = $schema->getConnection();
        $tags = [
            [
                'name' => 'The Vault',
                'slug' => 'the-vault',
                'description' => 'Exclusive downloadable legal documents, tax guides, and market reports.',
                'color' => '#6366f1',
                'position' => 1,
            ],
            [
                'name' => 'Business for Sale',
                'slug' => 'business-for-sale',
                'description' => 'Marketplace for buying/selling existing businesses in Bali.',
                'color' => '#8b5cf6',
                'position' => 2,
            ],
            [
                'name' => 'Business Need Fundings',
                'slug' => 'business-need-fundings',
                'description' => 'Pitching deck area for startups/projects looking for seed funding.',
                'color' => '#3b82f6',
                'position' => 3,
            ],
            [
                'name' => 'Business Consulting',
                'slug' => 'business-consulting',
                'description' => 'Designated area for vetted legal, tax, and KITAS consultants.',
                'color' => '#10b981',
                'position' => 4,
            ]
        ];

        foreach ($tags as $tag) {
            $exists = $db->table('tags')->where('slug', $tag['slug'])->exists();
            if (!$exists) {
                $db->table('tags')->insert(array_merge($tag, [
                    'created_at' => new \DateTime(),
                ]));
            }
        }
    },
    'down' => function (Builder $schema) {
        $db = $schema->getConnection();
        $db->table('tags')->whereIn('slug', ['the-vault', 'business-for-sale', 'business-need-fundings', 'business-consulting'])->delete();
    }
];
