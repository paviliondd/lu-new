<?php
/**
 * Plugin Name: LinuxUnity Translation Meta UI
 * Description: Editor UI and REST meta exposure for language and translation relationships.
 */

if (!defined('ABSPATH')) {
    exit;
}

function linuxunity_register_translation_meta(): void {
    register_post_meta('post', 'lang', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'sanitize_callback' => function ($value) {
            return in_array($value, ['vi', 'en'], true) ? $value : 'vi';
        },
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);

    register_post_meta('post', 'translation_of', [
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'sanitize_callback' => 'absint',
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
}

add_action('init', 'linuxunity_register_translation_meta');

function linuxunity_translation_meta_box(): void {
    add_meta_box(
        'linuxunity_translation_meta',
        'LinuxUnity Translation',
        'linuxunity_render_translation_meta_box',
        'post',
        'side',
        'default'
    );
}

add_action('add_meta_boxes', 'linuxunity_translation_meta_box');

function linuxunity_render_translation_meta_box(WP_Post $post): void {
    $lang = get_post_meta($post->ID, 'lang', true) ?: 'vi';
    $translation_of = (int) get_post_meta($post->ID, 'translation_of', true);
    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => ['publish', 'draft', 'pending', 'future', 'private'],
        'numberposts' => 200,
        'orderby' => 'date',
        'order' => 'DESC',
        'exclude' => [$post->ID],
    ]);

    wp_nonce_field('linuxunity_translation_meta', 'linuxunity_translation_meta_nonce');
    ?>
    <p>
        <label for="linuxunity_lang"><strong>Language</strong></label>
        <select id="linuxunity_lang" name="linuxunity_lang" class="widefat">
            <option value="vi" <?php selected($lang, 'vi'); ?>>Vietnamese (vi)</option>
            <option value="en" <?php selected($lang, 'en'); ?>>English (en)</option>
        </select>
    </p>
    <p>
        <label for="linuxunity_translation_of"><strong>Translation of</strong></label>
        <select id="linuxunity_translation_of" name="linuxunity_translation_of" class="widefat">
            <option value="0">None</option>
            <?php foreach ($posts as $candidate): ?>
                <option value="<?php echo esc_attr((string) $candidate->ID); ?>" <?php selected($translation_of, $candidate->ID); ?>>
                    <?php echo esc_html($candidate->post_title ?: '#' . $candidate->ID); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </p>
    <?php
}

function linuxunity_save_translation_meta(int $post_id): void {
    if (
        !isset($_POST['linuxunity_translation_meta_nonce']) ||
        !wp_verify_nonce((string) $_POST['linuxunity_translation_meta_nonce'], 'linuxunity_translation_meta')
    ) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $lang = sanitize_text_field((string) ($_POST['linuxunity_lang'] ?? 'vi'));
    update_post_meta($post_id, 'lang', in_array($lang, ['vi', 'en'], true) ? $lang : 'vi');

    $translation_of = absint($_POST['linuxunity_translation_of'] ?? 0);
    if ($translation_of > 0 && $translation_of !== $post_id) {
        update_post_meta($post_id, 'translation_of', $translation_of);
    } else {
        delete_post_meta($post_id, 'translation_of');
    }
}

add_action('save_post_post', 'linuxunity_save_translation_meta');
