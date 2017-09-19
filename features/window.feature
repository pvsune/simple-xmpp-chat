Feature: Persisten window state

	Scenario: Close the widget box

		When I click the "CLOSE" button
		Then the "webchat widget box" should be "hidden"

	Scenario: Check widget persistence 

		Given that the client website is "http://localhost:8080/mercer"
		When I go to the website and let it load for "5" seconds
		Then the "webchat widget box" should be "hidden"

	Scenario: Open the widget box

		When I click the "Talk to FundKo!" button
		Then the "webchat widget box" should be "visible"