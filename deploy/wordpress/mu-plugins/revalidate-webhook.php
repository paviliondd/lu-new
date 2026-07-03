<?php
/**
 * Plugin Name: LinuxUnity Revalidate Webhook
 * Description: Calls the Next.js revalidation endpoint when posts change.
 */

if (!defined('ABSPATH')) {
    exit;
}

function linuxunity_revalidate_post(int $post_id, WP_Post $post, bool $update): void {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    if ($post->post_type !== 'post' || $post->post_status !== 'publish') {
        return;
    }

    $secret = getenv('NEXT_REVALIDATE_SECRET') ?: '';
    $site_url = rtrim((string) (getenv('NEXT_PUBLIC_SITE_URL') ?: home_url()), '/');

    if ($secret === '' || $site_url === '') {
        return;
    }

    wp_remote_post($site_url . '/api/revalidate', [
        'timeout' => 3,
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Revalidate-Secret' => $secret,
        ],
        'body' => wp_json_encode([
            'slug' => $post->post_name,
            'lang' => get_post_meta($post_id, 'lang', true) ?: 'vi',
        ]),
    ]);
}

add_action('save_post_post', 'linuxunity_revalidate_post', 20, 3);
