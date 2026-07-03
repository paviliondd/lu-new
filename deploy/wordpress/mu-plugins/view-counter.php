<?php
/**
 * Plugin Name: LinuxUnity View Counter
 * Description: Public REST endpoint and read-only REST field for article view counts.
 */

if (!defined('ABSPATH')) {
    exit;
}

const LINUXUNITY_VIEW_META_KEY = '_view_count';
const LINUXUNITY_VIEW_RATE_WINDOW = 30 * MINUTE_IN_SECONDS;

function linuxunity_view_client_ip(): string {
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_REAL_IP'] ?? '',
        explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];

    foreach ($candidates as $candidate) {
        $ip = trim($candidate);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return '0.0.0.0';
}

function linuxunity_view_rate_key(int $post_id, string $ip): string {
    return 'linuxunity_view_' . md5($post_id . '|' . $ip);
}

function linuxunity_get_view_count(int $post_id): int {
    return max(0, (int) get_post_meta($post_id, LINUXUNITY_VIEW_META_KEY, true));
}

function linuxunity_increment_view_count(int $post_id): int {
    global $wpdb;

    $meta_table = $wpdb->postmeta;
    $meta_key = LINUXUNITY_VIEW_META_KEY;

    $wpdb->query('START TRANSACTION');

    $meta_id = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT meta_id FROM {$meta_table} WHERE post_id = %d AND meta_key = %s LIMIT 1 FOR UPDATE",
            $post_id,
            $meta_key
        )
    );

    if ($meta_id) {
        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$meta_table} SET meta_value = CAST(meta_value AS UNSIGNED) + 1 WHERE meta_id = %d",
                $meta_id
            )
        );
    } else {
        $wpdb->insert(
            $meta_table,
            [
                'post_id' => $post_id,
                'meta_key' => $meta_key,
                'meta_value' => '1',
            ],
            ['%d', '%s', '%s']
        );
    }

    $views = (int) $wpdb->get_var(
        $wpdb->prepare(
            "SELECT meta_value FROM {$meta_table} WHERE post_id = %d AND meta_key = %s LIMIT 1",
            $post_id,
            $meta_key
        )
    );

    $wpdb->query('COMMIT');

    return max(0, $views);
}

function linuxunity_register_view_counter_routes(): void {
    register_rest_route(
        'linuxunity/v1',
        '/posts/(?P<slug>[a-zA-Z0-9_-]+)/view',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'permission_callback' => '__return_true',
            'args' => [
                'slug' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_title',
                ],
            ],
            'callback' => function (WP_REST_Request $request) {
                $slug = sanitize_title((string) $request['slug']);
                $post = get_page_by_path($slug, OBJECT, 'post');

                if (!$post || $post->post_status !== 'publish') {
                    return new WP_Error('linuxunity_post_not_found', 'Post not found.', ['status' => 404]);
                }

                $ip = linuxunity_view_client_ip();
                $rate_key = linuxunity_view_rate_key((int) $post->ID, $ip);

                if (get_transient($rate_key)) {
                    return rest_ensure_response(['views' => linuxunity_get_view_count((int) $post->ID)]);
                }

                set_transient($rate_key, 1, LINUXUNITY_VIEW_RATE_WINDOW);
                $views = linuxunity_increment_view_count((int) $post->ID);

                return rest_ensure_response(['views' => $views]);
            },
        ]
    );

    register_rest_field(
        'post',
        'view_count',
        [
            'get_callback' => function (array $post) {
                return linuxunity_get_view_count((int) $post['id']);
            },
            'schema' => [
                'description' => 'LinuxUnity article view count.',
                'type' => 'integer',
                'context' => ['view', 'edit'],
                'readonly' => true,
            ],
        ]
    );
}

add_action('rest_api_init', 'linuxunity_register_view_counter_routes');
