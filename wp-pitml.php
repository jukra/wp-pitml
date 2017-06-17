<?php
/*
Plugin Name: Paste Images to Media Library
Plugin URI: https://github.com/jukra/wp-pitml
Description: Paste images from your cliboard directly to Media Library on the upload page.
Author: Jukka Rautanen
Version: 0.0.2
License: GPLv2 or later
Author URI: http:/rautanen.info
*/

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

class PasteImagesToMediaLibrary {
	function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enque_media_library_paste') );
	}
	//Include js file only on upload page
	function enque_media_library_paste($hook) {
	    if ( 'upload.php' != $hook ) {
	        return;
	    }
	    wp_enqueue_script( 'paste-images',  plugin_dir_url( __FILE__ ) . 'js/wp-pitml.js' );
	}
}
new PasteImagesToMediaLibrary;