(function($) {
    "use strict";

    // Constructor function for the typing effect
    const TypedEffect = function(el, options) {
        // jQuery reference to the target element
        this.$el = $(el);

        // Merge user options with default settings
        this.options = Object.assign({}, $.fn.typed.defaults, options);

        // Array of strings to type
        this.strings = this.options.strings;

        // Index of the currently active string in the array
        this.index = 0;

        // Character position within the current string
        this.char = 0;

        // Initialize typing effec
        this.init();
    };

    // Prototype methods for the TypedEffect object
    TypedEffect.prototype = {
        // Initialize the plugin
        init: function() {
            // If cursor is enabled, add it to the DOM after the target element
            if (this.options.showCursor) {
                this.$cursor = $('<span class="typed-cursor">' + this.options.cursorChar + '</span>');
                this.$el.after(this.$cursor);
            }

            // Begin typing the first string
            this.type();
        },

        // Handles the typing animation
        type: function() {
            // Get the current string
            const current = this.strings[this.index];

            // Get the substring to display up to the current character
            const nextChar = current.substring(0, this.char + 1);

            // Update the content of the element with the new text
            this.updateElement(nextChar);

            // Move to the next character
            this.char++;

            // If not done typing the string, continue typing
            if (this.char <= current.length) {
                setTimeout(() => this.type(), this.options.typeSpeed);
            } else {
                // After typing finishes, wait for backDelay, then start backspacing
                setTimeout(() => this.backspace(), this.options.backDelay);
            }
        },

        // Handles the backspace animation
        backspace: function() {
            // Get the current string
            const current = this.strings[this.index];

            // Remove the last character
            const nextChar = current.substring(0, this.char - 1);

            // Update the content of the element
            this.updateElement(nextChar);

            // Move to the previous character
            this.char--;

            // Continue backspacing if there are still characters left
            if (this.char >= 0) {
                setTimeout(() => this.backspace(), this.options.backSpeed);
            } else {
                // Move to the next string in the array
                this.index = (this.index + 1) % this.strings.length;

                // If not looping and we've typed all strings, stop
                if (!this.options.loop && this.index === 0) return;

                // Start typing the next string after a delay
                setTimeout(() => this.type(), this.options.startDelay);
            }
        },

        // Updates the content of the target element
        updateElement: function(text) {
            if (this.options.contentType === "html") {
                this.$el.html(text); // Interpret text as HTML
            } else {
                this.$el.text(text); // Treat as plain text
            }
        }
    };

    // jQuery plugin definition
    $.fn.typed = function(options) {
        return this.each(function() {
            // Only initialize once per element
            if (!$.data(this, "typed")) {
                $.data(this, "typed", new TypedEffect(this, options));
            }
        });
    };

    // Default settings for the plugin
    $.fn.typed.defaults = {
        strings: [],           // Strings to be typed
        typeSpeed: 50,         // Delay between keystrokes
        backSpeed: 25,         // Speed when deleting text
        backDelay: 1500,       // Delay before backspacing starts
        startDelay: 500,       // Delay before typing starts
        loop: true,            // Loop through strings indefinitely
        showCursor: true,      // Show blinking cursor
        cursorChar: "|",       // Character used as cursor
        contentType: "html"    // 'html' or 'text' mode
    };

})(jQuery);

// Initialize the plugin on DOM ready
$(function() {
    $("#typed").typed({
        strings: [
            "Freshly graduated from Tampere University of Applied Sciences — now looking for my first developer role!",
            "From the land of ramen and cherry blossoms, now residing in the land of saunas and reindeer!",
            "Rocking the service sector as an entrepreneur in Finland for 15 years.",
            "Balancing coding with a love for cooking and travel—blending software development with global exploration."
        ]
    });
});