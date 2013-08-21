/*
 * TrelloAddons v0.0.2 <https://github.com/subinvarghesein/TrelloAddons>
 * Inspired by TrelloWIPLimits <https://github.com/NateHark/TrelloWIPLimits/>
 *
 * Original Author:
 * Subin Varghese <https://github.com/subinvarghesein>
 */

;(function(){
    TrelloAddons = {};
    TrelloAddons.WIPLimits = function() {
        this.init = function() {
            var boards = $('#board .list');

            // Watch for list changes
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    setTimeout(function() { 
                        updateList($(mutation.target).closest('.list')); 
                    });
                });
            });
            var config = {childList: true, subtree: true};
            for(var i=0, len = boards.length; i<len; i++) {
                observer.observe(boards[i], config);
            }
            
            // Recalculate limits when the list title is changed
            $('#board')
                // When save button is clicked
                .on('click', '.js-save-edit', function(event) {
                    setTimeout(function() {
                        updateList($(event.target).closest('.list'), true);
                    });
                })
                // or When Enter is pressed in the textarea
                .on('keyup', 'textarea.single-line', function(event) {
                    if(event.which == 13) {
                        setTimeout(function() {
                            updateList($(event.target).closest('.list'), true);
                        });
                    }
                });
            
            updateList(boards);
        }

        function getWipLimits($list, forceRecalulate) {
            var listMatch = /\[([\d\s\-]+)\]/;
            if (!forceRecalulate) {
                var limits = $list.data('wip-limits');
                // If already calculated and cached
                if(limits) {
                    return limits;
                }
            }

            var listTitle = $list.find('.list-header h2').text(),
                limitText;

            var matches = listMatch.exec(listTitle);
            if(matches && matches.length == 2) {
                limitText = matches[1];
            } else {
                limitText = null;
            }

            if(limitText) {
                var limits = limitText.split('-');

                var limitsObj = null;

                if(limits.length == 2) {
                    var limitsObj = {
                        min: parseInt($.trim(limits[0]), 10),
                        max: parseInt($.trim(limits[1]), 10)
                    }
                }
                else if (limits.length == 1) {
                    var limitsObj = {
                        max: parseInt($.trim(limits[0]), 10)
                    }
                }

                $list.data('wip-limits', limitsObj);
                return limitsObj;
            }
            else {
                return null;
            }
        }

        function checkWipLimit($list, forceRecalulate) {
            $list.removeClass('over-limit');
            $list.removeClass('at-limit');

            var limits = getWipLimits($list, forceRecalulate);

            if(!limits) {
                return;
            }

            var $cards = $list.find('.list-card');
            var numOfCards = $list.find('.list-card').length - $list.find('.card-composer').length;

            if((numOfCards < limits.min)
                || (numOfCards > limits.max)
                || (limits.min == 0 && numOfCards == limits.min)) {
                $list.addClass('over-limit');
            }
            else if(numOfCards == limits.max) {
                $list.addClass('at-limit');
            }
        }

        function updateList($lists, forceRecalulate) {
            $lists.each(function() {
                checkWipLimit($(this), forceRecalulate);
            });
        }
    };

    $(document).ready(function(){
        (new TrelloAddons.WIPLimits).init();
    });
})();