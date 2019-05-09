/*
 * jQuery.floatcard - Floating message plugin
 * 
 * Copyright (c) 2019 Hisanori Kitagawa
 * Under The MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:  
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.  
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * メッセージやブロック要素をコンテンツ上にフロート表示する処理を提供します。<br>
 * <p>
 * クライアント処理上のメッセージやイメージ等を持つブロック要素をコンテンツ上に表示します。<br>
 * 表示するフロート要素はスタック表示され、ユーザーによるクローズや自動消去によって自動配置します。<br>
 * </p>
 * 
 * @author Kitagawa<br>
 * 
 *<!--
 * 更新日		更新者			更新内容
 * 2019/05/06	Kitagawa		新規作成
 *-->
 */
(function($, window, document, undefined) {
	'use strict';

	/**
	 * アイコン要素定義
	 */
	var icons = {
		/** 閉じるボタン */
		close : "<div class=\"ui-floatcard-icon-close\"><svg viewBox=\"0 0 16 16\"><path d=\"M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z\"></path></svg></div>"
	}

	/**
	 * 内部環境定義
	 */
	var config = {
		/** フロート要素表示間隔 */
		space : 10
	};

	/**
	 * ディフォルトオプション
	 */
	var defaults = {
		autoHide : false,
		autoHideDelay : 5000,
		clone : true,
		position : "right-top", // right-top, right-bottom, left-top, left-bottom, center-top, center-bottom, fill-top, fill-bottom
		state : "default", // default, fatal, error, warn, info
		styleClass : undefined,
		zIndex : 2000,
		container : undefined,
	};

	/**
	 * 内部処理変数
	 */
	var context = {
		/** フロート要素スタック */
		stack : [],

		/** フロート要素カウンタ */
		counter : 0
	};

	/**
	 * 新規にフロート要素を生成します。<br>
	 * @param element フロート化対象要素
	 * @param options 処理オプション
	 */
	var create = function(element, options) {
		var options = $.extend({}, defaults, options);
		var $element = element === undefined ? $("<div/>") : $(element);
		$element.css("position", "static");
		$element.attr("ui-floatcard-component", true);

		/*
		 * フロート要素生成
		 */
		var floatcardId = "" + (context.counter++);
		var $floatcard = $("<div/>");
		$floatcard.attr("id", "ui-floatcard-" + floatcardId);
		$floatcard.addClass("ui-floatcard");
		if (options.position === "right-top") {
			$floatcard.addClass("ui-floatcard-position-right-top");
			$floatcard.css("top", 0);
		} else if (options.position === "right-bottom") {
			$floatcard.addClass("ui-floatcard-position-right-bottom");
			$floatcard.css("bottom", 0);
		} else if (options.position === "left-top") {
			$floatcard.addClass("ui-floatcard-position-left-top");
			$floatcard.css("top", 0);
		} else if (options.position === "left-bottom") {
			$floatcard.addClass("ui-floatcard-position-left-bottom");
			$floatcard.css("bottom", 0);
		} else if (options.position === "center-top") {
			$floatcard.addClass("ui-floatcard-position-center-top");
			$floatcard.css("top", 0);
		} else if (options.position === "center-bottom") {
			$floatcard.addClass("ui-floatcard-position-center-bottom");
			$floatcard.css("bottom", 0);
		} else if (options.position === "fill-top") {
			$floatcard.addClass("ui-floatcard-position-fill-top");
			$floatcard.css("top", 0);
		} else if (options.position === "fill-bottom") {
			$floatcard.addClass("ui-floatcard-position-fill-bottom");
			$floatcard.css("bottom", 0);
		} else {
			$floatcard.addClass("ui-floatcard-position-right-top");
			$floatcard.css("top", 0);
			options.position = "right-top";
		}

		if (options.zIndex !== undefined) {
			$floatcard.css("z-index", options.zIndex);
		}
		if (options.styleClass !== undefined) {
			$floatcard.addClass("ui-floatcard-state-default");
			$floatcard.addClass(options.styleClass);
		} else {
			if (options.state === "default") {
				$floatcard.addClass("ui-floatcard-state-default");
			} else if (options.state === "fatal") {
				$floatcard.addClass("ui-floatcard-state-fatal");
			} else if (options.state === "error") {
				$floatcard.addClass("ui-floatcard-state-error");
			} else if (options.state === "warn") {
				$floatcard.addClass("ui-floatcard-state-warn");
			} else if (options.state === "info") {
				$floatcard.addClass("ui-floatcard-state-info");
			} else {
				$floatcard.addClass("ui-floatcard-state-default");
				options.state = "ui-floatcard-state-default";
			}
		}

		/*
		 * フロート要素オプション情報保持
		 */
		$floatcard.data("options", options);

		/*
		 * フロート要素スタック
		 */
		context.stack.push($floatcard);

		/*
		 * 要素配置用コンテナ生成
		 */
		var $floatcardContainer = $("<div/>");
		$floatcardContainer.addClass("ui-floatcard-container");

		/*
		 * 閉じるボタン要素生成
		 */
		var $iconClose = $(icons.close);
		$iconClose.bind("click.ui-floatcard", function() {
			remove($floatcard.attr("id"));
		});

		/*
		 * 自動消去時のタイムアウト処理
		 */
		if (options.autoHide) {
			setTimeout(function() {
				remove($floatcard.attr("id"));
			}, options.autoHideDelay);
		}

		/*
		 * コンテンツへのフロート要素追加
		 */
		$floatcardContainer.append($element);
		$floatcard.append($iconClose);
		$floatcard.append($floatcardContainer);
		if (options.container === undefined) {
			$("body").append($floatcard);
			$floatcard.css("position", "fixed");
		} else {
			$(options.container).append($floatcard);
		}

		/*
		 * フロート要素再配置
		 */
		reposition();
	};

	/**
	 * スタックされているフロート要素から対象の要素を削除します。<br>
	 * @param id 削除対象フロート要素ID
	 */
	var remove = function(id) {
		var $target = undefined;
		var targetIndex = -1;
		$(context.stack).each(function(index, $floatcard) {
			if (id === $floatcard.attr("id")) {
				$target = $floatcard;
				targetIndex = index;
				return false;
			}
		});
		if ($target === undefined) {
			return;
		}
		context.stack.splice(targetIndex, 1);
		$target.remove();
		reposition();
	};

	/**
	 * スタックされているすべてのフロート要素を再配置します。<br>
	 */
	var reposition = function() {
		var positions = {};
		$(context.stack).each(function(index, $floatcard) {
			var data = {
				container : $floatcard.data("options").container,
				position : $floatcard.data("options").position
			};
			var key = JSON.stringify(data);
			if (positions[key] === undefined) {
				positions[key] = 0;
			}

			var height = $floatcard.outerHeight();

			/* コンテナサイズオーバー時の挙動についての仕様は要検討
			var $container = data.container === undefined ? $("body") : $(data.container);
			if ($container.outerHeight() < positions[key] + height + 28) {
				$floatcard.hide();
			}
			*/

			if (data.position === "right-top" || data.position === "left-top" || data.position === "center-top" || data.position === "fill-top") {
				$floatcard.css("top", positions[key]);
				positions[key] += height + (config.space);
			} else {
				$floatcard.css("bottom", positions[key]);
				positions[key] += height + (config.space);
			}
		});
	};

	/**
	 * オブジェクトが配列オブジェクトか判定します。<br>
	 * @param object 判定対象オブジェクト
	 * @returns 配列オブジェクトの場合にtrueを返却 
	 */
	var isArray = function(object) {
		return Object.prototype.toString.call(object) === "[object Array]";
	};

	/**
	 * 対象要素をフロート要素として構築します。<br>
	 * @param options 処理オプション
	 * @return 生成したフロート要素
	 */
	$.fn.floatcard = function(options) {
		var options = $.extend({}, defaults, options);
		return this.each(function() {
			var $this = $(this);
			if ($this.get(0) === undefined) {
				return true;
			}
			if ($this.attr("ui-floatcard-component") !== undefined) {
				return true;
			}
			var $target = options.clone === true ? $this.clone(true) : $this;
			$target.css("display", "block");
			create($target, options);
		});
	};

	/**
	 * 要素又は、文字列をフロート要素として構築します。<br>
	 * @param object フロート化対象要素又は、文字列
	 * @param options 処理オプション
	 * @return 生成したフロート要素
	 */
	$.floatcard = function(object, options) {
		if (object === undefined) {
			create(undefined, options);
		} else if (typeof object === "string") {
			var value = $("<dummy/>").text(object).html().replace(/\r\n|\r|\n/g, "<br>");
			var $element = $("<div/>");
			$element.html(value);
			create($element, options);
		} else if (typeof object === "boolean" || typeof object === "number") {
			$.floatcard(object.toString(), options);
		} else if (isArray(object)) {
			$(object).each(function(index, element) {
				$.floatcard(element, options);
			});
		} else {
			create($(object), options);
		}
	};
})(jQuery, window, window.document);
