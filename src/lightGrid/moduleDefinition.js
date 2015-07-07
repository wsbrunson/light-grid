﻿if (typeof ($) === "undefined") {
	throw new Error("Light Grid requires jQuery.");
}

if (angular.element !== $) {
	throw new Error("jQuery must be included before Angular.");
}

var gridModule = angular.module("lightGrid", []);

gridModule.constant("DEFAULT_VIEW_NAME", "*");
