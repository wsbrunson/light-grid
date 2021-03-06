﻿/**
 * The root grid directive.
 * Parameters:
 *  - id - {String} ID of the grid. This attribute must be present and unique.
 *  - model - {Array} (interpolated) data model displayed on the grid (optional).
 *  - initial-view - {String} Name of the initial view mode of all rows in the grid.
 */
angular.module("lightGrid").directive("lgGrid", function gridDirective() {
	"use strict";

	var gridController = function GridController($scope) {

		var columnDefinitions = {};
		$scope.visibleColumns = [];

		/**
		 * Gets the model displayed on the grid.
		 * @return {Array} Model displayed on the grid.
		 */
		this.getData = function getData() {
			return $scope.model;
		};

		/**
		 * Gets the current view model displayed on the grid.
		 * @return {Array} Current state of the grid's view model
		 */
		this.getViewData = function getViewData() {
			if (angular.isArray($scope.model)) {
				return $scope.model.map(function(elem) {
					return elem.$viewData;
				});
			} else {
				var gridViewData = {};

				for (var prop in $scope.model) {
					if ($scope.model.hasOwnProperty(prop)) {
						gridViewData[prop] = $scope.model[prop].$viewData;
					}
				}

				return gridViewData;
			}
		};

		/**
		 * Sets the model of the grid.
		 * @param {[type]} newData [description]
		 */
		this.setData = function setData(newData) {
			$scope.model = newData;
		};

		function updateVisibleColumns() {
			$scope.visibleColumns.length = 0;

			for (var id in columnDefinitions) {
				if (columnDefinitions.hasOwnProperty(id) && columnDefinitions[id].definition.visible) {
					$scope.visibleColumns.push(columnDefinitions[id].definition);
				}
			}
		}

		/**
		 * Registers a column template.
		 * @param {Object} columnDefinition Column definition object
		 */
		this.defineColumn = function defineColumn(id, columnDefinition) {
			columnDefinitions[id] = { definition: columnDefinition };

			updateVisibleColumns();
		};

		/**
		 * Updates a registered column template.
		 * @param {Object} columnDefinition Column definition object
		 */
		this.updateColumn = function updateColumn(id, columnDefinition) {
			if (!columnDefinitions.hasOwnProperty(id)) {
				throw new Error("Column " + id + " was not registered.");
			}

			angular.extend(columnDefinitions[id].definition, columnDefinition);
			updateVisibleColumns();
		};

		/**
		 * Changes a view in all visible rows of the grid.
		 *
		 * @param {String} viewName Name of the new view.
		 */
		this.switchView = function switchView(viewName) {
			$scope.$broadcast("lightGrid.row.switchView", viewName);
		};

		/**
		 * Copies values from the view model to the data model.
		 * This method is asynchronous.
		 */
		this.acceptViewModel = function acceptViewModel() {
			$scope.$broadcast("lightGrid.row.acceptViewModel");
		};

		/**
		 * Gets the scope of the grid directive.
		 * @return {Scope} Scope of the grid directive.
		 */
		this.getScope = function getScope() {
			return $scope;
		};

		/**
		 * Creates a new scope for transcluded elements. The new scope inherits from the grid's parent scope.
		 * @returns {Scope} The new scope.
		 */
		this.createTransclusionScope = function createTransclusionScope() {
			return $scope.$parent.$new();
		};
	};

	// TODO: footer support
	var defaultTemplate =
		"<table class='light-grid'>" +
			"<thead><tr lg-header-row></tr></thead>" +
			"<tbody><tr lg-row default-view='read' initial-view='{{ ::initialView || \"read\" }}' ng-repeat='rowData in model'></tr></tbody>" +
		"</table>";

	return {
		scope: {
			model: "=",
			initialView: "@"
		},
		template: defaultTemplate,
		replace: true,
		restrict: "EA",
		transclude: true,
		link: function gridLink(scope, elem, attrs, controller, transclude) {
			// directives such as dataProvider require access to the parent of the grid scope,
			// so they can't be linked with the grid scope (as it's isolated).
			var transclusionScope = scope.$parent.$new();
			transclude(transclusionScope, function(clone) {
				elem.append(clone);
			});
		},
		controller: gridController,
		controllerAs: "gridController"
	};
});
