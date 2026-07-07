<?php
/**
 * Plugin Name: LinuxUnity Featured Image REST Field
 * Description: Exposes a stable featured_image_url field for the headless frontend.
 */

if (!defined('ABSPATH')) {
    exit;
}

function linuxunity_featured_image_url(int $post_id): ?string {
    $thumbnail_id = get_post_thumbnail_id($post_id);

    if (!$thumbnail_id) {
        return null;
    }

    $image = wp_get_attachment_image_src($thumbnail_id, 'full');

    if (is_array($image) && !empty($image[0])) {
        return esc_url_raw((string) $image[0]);
    }

    $url = wp_get_attachment_url($thumbnail_id);
    return $url ? esc_url_raw((string) $url) : null;
}

function linuxunity_register_featured_image_rest_field(): void {
    register_rest_field(
        'post',
        'featured_image_url',
        [
            'get_callback' => function (array $post) {
                return linuxunity_featured_image_url((int) $post['id']);
            },
            'schema' => [
                'description' => 'Full URL for the post featured image.',
                'type' => ['string', 'null'],
                'context' => ['view', 'edit'],
                'readonly' => true,
            ],
        ]
    );
}

add_action('rest_api_init', 'linuxunity_register_featured_image_rest_field');
