(function ($) {
    "use strict";
    function refreshUl($ul) {
        $.each($ul.find("li"), function () {
            var $li,
                $option;

            $li = $(this);
            $option = $($li.data("option"));

            if (!$option.length) {
                return;
            }

            if ($option.is(':selected')) {
                $li.addClass("selected");
            }
            else {
                $li.removeClass("selected");
            }
        });
    }

    function scrollToFirstSelected($ul) {
        var $first,
            initialPosition;

        $first = $ul.find("li.selected:first");

        if ($first.length > 0) {
            initialPosition = $first.offset().top - $ul.offset().top;
            $ul.scrollTop(initialPosition);
        }
    }

    //event handler for when a user clicks the dropdown
    function dropdownClick($ul, e) {
        var isVisible = $ul.is(':visible');

        $('.giantdropdown').hide();
        if (!isVisible) {
            $(document).bind('click.giantDropdown', function (e) {
                $ul.hide();
                $(this).unbind(e);
            });
            scrollToFirstSelected($ul);
            $ul.show();
            e.stopPropagation();
        }
    }

    //Used to create the markup and behaviours of the textarea
    function createTextArea($dropdown, $ul, disabled) {
        var $textArea = $("<textarea readonly='true'/>");

        $textArea.prop('id', $dropdown.prop('id') + '_giantDropDownTextArea');
        $textArea.prop("style", $dropdown.attr("style"));
        $textArea.addClass($dropdown.prop("class"));
        $textArea.addClass('inline dropDownTextArea');
        $textArea.css('display', '');

        $textArea.click(function (e) {
            dropdownClick($ul, e);
        });

        if (disabled) {
            $textArea.prop('disabled', 'disabled');
        }

        return $textArea;
    }

    //Used to create the markup and behaviours of the button
    function createButton($dropdown, $ul, disabled) {
        var $button = $("<button type='button'>&#x25BC;</button>");

        $button.prop('id', $dropdown.attr('id') + '_giantDropDownButton');
        $button.addClass('inline dropDownButton btn');

        $button.click(function (e) {
            dropdownClick($ul, e);
        });

        if (disabled) {
            $button.prop('disabled', 'disabled');
        }

        return $button;
    }

    //Used to create the markup of the list
    function createUL($dropdown) {
        var $ul = $("<ul />");

        $ul.addClass("giantdropdown clearBoth fullWidth");
        $ul.prop('id', $dropdown.prop('id') + '_giantDropDownList');

        if ($dropdown.attr("multiple")) {
            $ul.addClass("multiple");
        }

        return $ul;
    }

    //Used to create the markup and behaviours of the options in the list
    function createListOptions($dropdown, $textArea, $ul) {
        $.each($dropdown.find('option, optgroup'), function () {
            var option,
                $option,
                $li;

            option = this;
            $option = $(option);

            $li = $("<li />");
            $li.addClass(option.tagName.toLowerCase());

            $li.addClass($option.prop("class"));
            $li.attr("style", $option.attr("style"));

            if (option.tagName === "OPTGROUP") {
                $li.text(option.label);
            }
            else if (option.tagName === "OPTION") {
                $li.text(option.text);
                $li.data("option", option);

                $li.click(function () {
                    var value;

                    if ($dropdown[0].disabled) {
                        return;
                    }

                    option.selected = !option.selected;
                    value = $(option).val();
                    $dropdown.val(value);
                    $dropdown.trigger('change');
                    refreshUl($ul);
                    $textArea.val($li.text());
                    $ul.hide();
                });
            }

            $ul.append($li);
        });
    }

    function createGiantDropDown($dropdown, disabled) {
        var $ul,
            $divGiantDropdownContainer,
            $divGiantDropdownSelectContainer,
            $divGiantDropdownListContainer,
            $textArea,
            $button;

        $ul = createUL($dropdown);

        $divGiantDropdownContainer = $("<div />");
        $divGiantDropdownContainer.prop('id', $dropdown.prop('id') + '_giantDropDownContainer');
        $divGiantDropdownContainer.addClass("clearBoth");

        $divGiantDropdownSelectContainer = $("<div style='position:relative' />");
        $divGiantDropdownSelectContainer.addClass("clearBoth");

        $divGiantDropdownListContainer = $("<div style='position:relative' />");
        $divGiantDropdownListContainer.addClass("clearBoth inlineBlock fullWidth");

        $textArea = createTextArea($dropdown, $ul, disabled);
        $button = createButton($dropdown, $ul, disabled);

        //hide the original dropdown
        $dropdown.hide();

        //add the list to our select container
        $divGiantDropdownSelectContainer.append($ul);

        //add in the button and textarea
        $divGiantDropdownListContainer.append($textArea);
        $divGiantDropdownListContainer.append($button);

        //put the two containers in the dropdown container
        $divGiantDropdownContainer.append($divGiantDropdownListContainer);
        $divGiantDropdownContainer.append($divGiantDropdownSelectContainer);

        //add the dropdown container after the original select
        $dropdown.after($divGiantDropdownContainer);

        //hide the new dropdown list
        $ul.hide();

        //set a marker, to know a giant dropdown has already been created
        $dropdown.data("giantDropdown", $ul);

        //create all of options in the new dropdown
        createListOptions($dropdown, $textArea, $ul);

        //set the textarea value to the selected value of the dropdown
        $textArea.val($dropdown.find(":selected").text());

        refreshUl($ul);
    }

    var methods = {
        init: function () {
            return this.each(function () {
                var disabled = false,
                    $dropdown = $(this);

                // not a dropdown
                if (this.tagName !== "SELECT") {
                    alert('The passed in element is not a select');
                    return;
                }

                //Only apply to selects with an id
                if (($(this).prop('id') === undefined) || ($(this).prop('id') === "")) {
                    alert('The select needs to have an ID');
                    return;
                }

                //set the disabled flag if the dropdown is disabled
                if ($(this).is(':disabled')) {
                    disabled = true;
                }

                // already giant-ified
                if ($dropdown.data("giantDropdown") !== null) {
                    //destroy the original dropdown so that we can redraw
                    $('#' + $dropdown.prop('id') + '_giantDropDownContainer').remove();
                }

                //we have everything we need, so lets create the dropdown
                createGiantDropDown($dropdown, disabled);
            });
        },

        scrollToFirstSelected: function () {
            return this.each(function () {
                scrollToFirstSelected($(this));
            });
        }
    };

    $.fn.giantDropdown = function (method) {
        if (!method || typeof method === "object") {
            return methods.init.apply(this);
        }
        return methods[method].apply(this);
    };
} (jQuery));
