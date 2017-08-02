import * as d3 from 'd3';
import { d3keybinding } from '../lib/d3.keybinding.js';
import { t } from '../util/locale';
import { modeSave } from '../modes/index';
import { svgIcon } from '../svg/index';
import { uiCmd } from './cmd';
import { uiTooltipHtml } from './tooltipHtml';
import { tooltip } from '../util/tooltip';
import _ from 'lodash';


export function uiSave(context) {
    var history = context.history(),
        notifier = context.notifier(),
        key = uiCmd('⌘S');


    function saving() {
        return context.mode().id === 'save';
    }


    function save() {
        if (d3.event) d3.event.preventDefault();
        if (!context.inIntro() && !saving() && history.hasChanges()) {
            context.enter(modeSave(context));
        }
    }


    function notify(enabled) {
        notifier.send('save:status', {enabled: enabled});
    }


    function getBackground(numChanges) {
        var step;
        if (numChanges === 0) {
            return null;
        } else if (numChanges <= 50) {
            step = numChanges / 50;
            return d3.interpolateRgb('#fff', '#ff8')(step);  // white -> yellow
        } else {
            step = Math.min((numChanges - 50) / 50, 1.0);
            return d3.interpolateRgb('#ff8', '#f88')(step);  // yellow -> red
        }
    }


    function externalButton() {
        var numChanges = 0;
        var notifyDebounced = _.debounce(notify, 100);

        function updateCount() {
            var _ = history.difference().summary().length;
            if (_ === numChanges) return;
            numChanges = _;

            notifyDebounced(numChanges > 0 && !saving());
        }

        context.history()
            .on('change.save', updateCount);

        context
            .on('enter.save', function() {
                notifyDebounced(numChanges > 0 && !saving());
            });

        var keybinding = d3keybinding('save')
            .on(key, save, true);

        d3.select(document)
            .call(keybinding);

        notifier.on('save:click', save);
    }


    function uiButton(selection) {
        var numChanges = 0;

        function updateCount() {
            var _ = history.difference().summary().length;
            if (_ === numChanges) return;
            numChanges = _;

            tooltipBehavior
                .title(uiTooltipHtml(
                    t(numChanges > 0 ? 'save.help' : 'save.no_changes'), key)
                );

            var background = getBackground(numChanges);

            button
                .classed('disabled', numChanges === 0)
                .classed('has-count', numChanges > 0)
                .style('background', background);

            button.select('span.count')
                .text(numChanges)
                .style('background', background)
                .style('border-color', background);
        }


        var tooltipBehavior = tooltip()
            .placement('bottom')
            .html(true)
            .title(uiTooltipHtml(t('save.no_changes'), key));

        var button = selection
            .append('button')
            .attr('class', 'save col12 disabled')
            .attr('tabindex', -1)
            .on('click', save)
            .call(tooltipBehavior);

        button
            .call(svgIcon('#icon-save', 'pre-text'))
            .append('span')
            .attr('class', 'label')
            .text(t('save.title'));

        button
            .append('span')
            .attr('class', 'count')
            .text('0');

        updateCount();


        var keybinding = d3keybinding('save')
            .on(key, save, true);

        d3.select(document)
            .call(keybinding);

        context.history()
            .on('change.save', updateCount);

        context
            .on('enter.save', function() {
                button.property('disabled', saving());
                if (saving()) button.call(tooltipBehavior.hide);
            });
    }

    return notifier ? externalButton : uiButton;
}
