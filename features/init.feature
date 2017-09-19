Feature: Webchat Widget Loading

	Scenario: Load webchat widget

		Given that the client website is "http://localhost:8080/mercer"
		When I go to the website and let it load for "5" seconds
		Then the "webchat widget" should be "visible"

