Feature: Webchat Widget

	Scenario: Load webchat widget

		When page is loaded
		Then the "webchat widget" should be visible

	Scenario: Load pre-chat form

		Given that the pre-chat form is "required"
		And that there are no pre-chat data stored in cookies
		When page is loaded
		Then the "webchat widget" should be visible
		And the "pre-chat form" should be visible

