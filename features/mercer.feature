Feature: Webchat Widget on Mercer Sample Site

	Scenario: Load webchat widget

		Given that the client website is "http://localhost:8080/mercer"
		When I go to the website and let it load for "5" seconds
		Then the "webchat widget" should be "visible"

	Scenario: Pre-chat should be hidden 
	
		Then the "pre-chat form" should be "hidden"

	Scenario: Close the widget box

		When I click the "CLOSE" button
		Then the "webchat widget box" should be "hidden"

	Scenario: Check widget persistence 

		Given that the client website is "http://localhost:8080/"
		When I go to the website and let it load for "5" seconds
		Then the "webchat widget box" should be "hidden"

	Scenario: Open the widget box

		When I click the "Talk to Mercer!" button
		Then the "webchat widget box" should be "visible"