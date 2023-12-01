/*global gettext, interpolate, ngettext*/
'use strict';
{
    const show = function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.classList.remove('hidden');
        });
    };

    const hide = function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.classList.add('hidden');
        });
    };

    const showQuestion = function (options) {
        hide(options.acrossClears);
        show(options.acrossQuestions);
        hide(options.allContainer);
    };

    const showClear = function (options) {
        show(options.acrossClears);
        hide(options.acrossQuestions);
        document.querySelector(options.actionContainer).classList.remove(options.selectedClass);
        show(options.allContainer);
        hide(options.counterContainer);
    };

    const reset = options => {
        hide(options.acrossClears);
        hide(options.acrossQuestions);
        hide(options.allContainer);
        show(options.counterContainer);
    };

    const clearAcross = options => {
        reset(options);
        const acrossInputs = document.querySelectorAll(options.acrossInput);
        acrossInputs.forEach(function (acrossInput) {
            acrossInput.value = 0;
        });
        document.querySelector(options.actionContainer).classList.remove(options.selectedClass);
    };

    const checker = (actionCheckboxes, options, checked) => {
        if (checked) {
            showQuestion(options);
        } else {
            reset(options);
        }
        actionCheckboxes.forEach(function (el) {
            el.checked = checked;
            el.closest('tr').classList.toggle(options.selectedClass, checked);
        });
    };

    const updateCounter = (actionCheckboxes, options) => {
        const sel = Array.from(actionCheckboxes).filter(function (el) {
            return el.checked;
        }).length;
        const counter = document.querySelector(options.counterContainer);
        // data-actions-icnt is defined in the generated HTML
        // and contains the total amount of objects in the queryset
        // GRAPPELLI CUSTOM: counterSpan is a different class
        const counter_span = document.querySelector(options.counterSpan);
        const actions_icnt = Number(counter_span.dataset.actionsIcnt);
        counter.textContent = interpolate(
            ngettext('%(sel)s of %(cnt)s selected', '%(sel)s of %(cnt)s selected', sel), {
                sel: sel,
                cnt: actions_icnt
            }, true);
        const allToggle = document.getElementById(options.allToggleId);
        allToggle.checked = sel === actionCheckboxes.length;
        if (allToggle.checked) {
            showQuestion(options);
        } else {
            clearAcross(options);
        }
    };

    // GRAPPELLI CUSTOM: changed classes, added class for counterSpan
    const defaults = {
        actionContainer: "div.grp-changelist-actions",
        counterSpan: "span.action-counter",
        counterContainer: "li.grp-action-counter span.grp-action-counter",
        allContainer: "div.grp-changelist-actions li.grp-all",
        acrossInput: "div.grp-changelist-actions input.select-across",
        acrossQuestions: "div.grp-changelist-actions li.grp-question",
        acrossClears: "div.grp-changelist-actions li.grp-clear-selection",
        allToggleId: "action-toggle",
        selectedClass: "grp-selected"
    };

    window.Actions = function (actionCheckboxes, options) {
        options = Object.assign({}, defaults, options);
        let list_editable_changed = false;
        let lastChecked = null;
        let shiftPressed = false;

        document.addEventListener('keydown', (event) => {
            shiftPressed = event.shiftKey;
        });

        document.addEventListener('keyup', (event) => {
            shiftPressed = event.shiftKey;
        });

        document.getElementById(options.allToggleId).addEventListener('click', function (event) {
            checker(actionCheckboxes, options, this.checked);
            updateCounter(actionCheckboxes, options);
        });

        document.querySelectorAll(options.acrossQuestions + " a").forEach(function (el) {
            el.addEventListener('click', function (event) {
                event.preventDefault();
                const acrossInputs = document.querySelectorAll(options.acrossInput);
                acrossInputs.forEach(function (acrossInput) {
                    acrossInput.value = 1;
                });
                showClear(options);
            });
        });

        document.querySelectorAll(options.acrossClears + " a").forEach(function (el) {
            el.addEventListener('click', function (event) {
                event.preventDefault();
                document.getElementById(options.allToggleId).checked = false;
                clearAcross(options);
                checker(actionCheckboxes, options, false);
                updateCounter(actionCheckboxes, options);
            });
        });

        function affectedCheckboxes(target, withModifier) {
            const multiSelect = (lastChecked && withModifier && lastChecked !== target);
            if (!multiSelect) {
                return [target];
            }
            const checkboxes = Array.from(actionCheckboxes);
            const targetIndex = checkboxes.findIndex(el => el === target);
            const lastCheckedIndex = checkboxes.findIndex(el => el === lastChecked);
            const startIndex = Math.min(targetIndex, lastCheckedIndex);
            const endIndex = Math.max(targetIndex, lastCheckedIndex);
            const filtered = checkboxes.filter((el, index) => (startIndex <= index) && (index <= endIndex));
            return filtered;
        };

        Array.from(document.getElementById('result_list').tBodies).forEach(function (el) {
            el.addEventListener('change', function (event) {
                const target = event.target;
                if (target.classList.contains('action-select')) {
                    const checkboxes = affectedCheckboxes(target, shiftPressed);
                    checker(checkboxes, options, target.checked);
                    updateCounter(actionCheckboxes, options);
                    lastChecked = target;
                } else {
                    list_editable_changed = true;
                }
            });
        });

        // GRAPPELLI CUSTOM: changed class
        document.querySelector('#grp-changelist-form button[name=index]').addEventListener('click', function () {
            if (list_editable_changed) {
                const confirmed = confirm(gettext("You have unsaved changes on individual editable fields. If you run an action, your unsaved changes will be lost."));
                if (!confirmed) {
                    /** global: event */
                    event.preventDefault();
                }
            }
        });

        // GRAPPELLI CUSTOM: changed class
        const el = document.querySelector('#grp-changelist-form input[name=_save]');
        // The button does not exist if no fields are editable.
        if (el) {
            el.addEventListener('click', function (event) {
                if (document.querySelector('[name=action]').value) {
                    const text = list_editable_changed
                        ? gettext("You have selected an action, but you haven’t saved your changes to individual fields yet. Please click OK to save. You’ll need to re-run the action.")
                        : gettext("You have selected an action, and you haven’t made any changes on individual fields. You’re probably looking for the Go button rather than the Save button.");
                    if (!confirm(text)) {
                        event.preventDefault();
                    }
                }
            });
        }
    };

    // Call function fn when the DOM is loaded and ready. If it is already
    // loaded, call the function now.
    // http://youmightnotneedjquery.com/#ready
    const ready = fn => {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    ready(function () {
        const actionsEls = document.querySelectorAll('tr input.action-select');
        if (actionsEls.length > 0) {
            Actions(actionsEls);
        }
    });
}