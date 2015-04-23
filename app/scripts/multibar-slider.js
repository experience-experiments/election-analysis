(function () {
	'use strict';
	var $ = window.jQuery;
	var buckets = [];

	function MultiBarSlider(parentEl, options) {
		buckets = options.buckets;
		var domTree = $('<div class="multibar-slider-list"></div>');
		for (var i in buckets) {
			domTree.append(
				$('<div></div>')
					.addClass(buckets[i].key).addClass('bucket')
					.append('<span>' + buckets[i].value + '%' + '</span>')
					.css('height', buckets[i].value + '%')
					.append('<div class="handle"></div>')
			);
		}
		$(parentEl).append(domTree);
		addDragHandlers(domTree);
	}

	function addDragHandlers(domTree) {
		domTree.find('.handle').mousedown(function (downEvent) {
			var handleEl = downEvent.target;
			var bar = $(handleEl.parentNode.parentNode);
			var currentBucket = $(handleEl.parentNode);
			var nextBucket = currentBucket.next();

			var maxHeight = bar.outerHeight();
			var currentPercentage = currentBucket.outerHeight() / maxHeight;
			var nextPercentage = nextBucket.outerHeight() / maxHeight;

			domTree.mousemove(function (moveEvent) {
				bar.addClass('dragging');
				currentBucket.addClass('active');

				var diffPercentage = (moveEvent.pageY - downEvent.pageY) / maxHeight;

				var newPercentage = ((currentPercentage + diffPercentage) * 100).toFixed(1) + '%';
				currentBucket.css('height', newPercentage).find('span').html(newPercentage);

				var newNextPercentage = ((nextPercentage - diffPercentage) * 100).toFixed(1) + '%';
				nextBucket.css('height', newNextPercentage).find('span').html(newNextPercentage);

			});

			domTree.mouseup(function () {
				domTree.unbind("mousemove");
				domTree.unbind("mouseup");
				bar.removeClass('dragging');
				currentBucket.removeClass('active');
			});
		});

	}

	if (!window.multiBarSlider) {
		window.multibarSlider = MultiBarSlider;
	}
})();
