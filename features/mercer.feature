Feature: Webchat Widget on Mercer Sample Site

	Scenario: Load webchat widget

		Given that the client is "Mercer"
		And the client website is "http://localhost:8080/mercer"
		When page is loaded for "5" seconds
		Then the "webchat widget" should be "visible"
		And the "pre-chat form" should be "hidden"

	Scenario: Open / close widget box

		When I click the "CLOSE" button
		Then the "webchat widget" should be "hidden"

		When I click the "Talk to Mercer!" button
		Then the "webchat widget" should be "visible"
