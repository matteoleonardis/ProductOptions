/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'underscore',
    'matchMedia',
    'Magento_PageBuilder/js/utils/breakpoints',
    'Magento_PageBuilder/js/events',
    'slick'
], function ($, _, mediaCheck, breakpointsUtils, events) {
    'use strict';

    /**
     * Build slick
     *
     * @param {jQuery} $carouselElement
     * @param {Object} config
     */
    function buildSlick($carouselElement, config) {
        /**
         * Prevent each slick slider from being initialized more than once which could throw an error.
         */
        if ($carouselElement.hasClass('slick-initialized')) {
            $carouselElement.slick('unslick');
        }

        $carouselElement.slick(config);
    }

    /**
     * Initialize slider.
     *
     * @param {jQuery} $element
     * @param {Object} slickConfig
     * @param {Object} breakpoint
     */
    function initSlider($element, slickConfig, breakpoint) {
        var productCount = $element.find('.product-item').length,
            $carouselElement = $($element.children()),
            centerModeClass = 'center-mode',
            carouselMode = $element.data('carousel-mode'),
            product_to_show = breakpoint.options.products[carouselMode] ?
                breakpoint.options.products[carouselMode].product_to_show :
                breakpoint.options.products.default.product_to_show,
            product_to_scroll = breakpoint.options.products[carouselMode] ?
                breakpoint.options.products[carouselMode].product_to_scroll :
                breakpoint.options.products[carouselMode].product_to_show;

        slickConfig.product_to_scroll = parseFloat(product_to_scroll);

        slickConfig.product_to_show = parseFloat(product_to_show);

        if (carouselMode === 'continuous' && productCount > slickConfig.product_to_show) {
            $element.addClass(centerModeClass);
            slickConfig.centerPadding = $element.data('center-padding');
            slickConfig.centerMode = true;
        } else {
            $element.removeClass(centerModeClass);
            slickConfig.infinite = $element.data('infinite-loop');
        }

        buildSlick($carouselElement, slickConfig);
    }

    return function (config, element) {
        var $element = $(element),
            $carouselElement = $($element.children()),
            currentViewport = config.currentViewport,
            currentBreakpoint = config.breakpoints[currentViewport],
            slickConfig = {
                autoplay: $element.data('autoplay'),
                autoplaySpeed: $element.data('autoplay-speed') || 0,
                arrows: $element.data('show-arrows'),
                dots: $element.data('show-dots')
            };

        _.each(config.breakpoints, function (breakpoint) {
            mediaCheck({
                media: breakpointsUtils.buildMedia(breakpoint.conditions),

                /** @inheritdoc */
                entry: function () {
                    initSlider($element, slickConfig, breakpoint);
                }
            });
        });

        //initialize slider when content type is added in mobile viewport
        if (currentViewport === 'mobile') {
            initSlider($element, slickConfig, currentBreakpoint);
        }

        // Redraw slide after content type gets redrawn
        events.on('contentType:redrawAfter', function (args) {
            if ($carouselElement.closest(args.element).length) {
                $carouselElement.slick('setPosition');
            }
        });

        events.on('stage:viewportChangeAfter', function (args) {
            var breakpoint = config.breakpoints[args.viewport];

            initSlider($element, slickConfig, breakpoint);
        });
    };
});
