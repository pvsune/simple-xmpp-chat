Feature: Webchat Widget on Mercer Sample Site

	Scenario: Load webchat widget

		Given that we are testing the widget on "http://localhost:8080/mercer"
		When page is loaded for "5" seconds
		Then the "webchat widget" should be "visible"
		And the "pre-chat form" should be "hidden"
