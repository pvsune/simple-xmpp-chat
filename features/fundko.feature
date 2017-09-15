Feature: Webchat Widget on Fundko Sample Site

	Scenario: Load webchat widget

		Given that the client website is "http://localhost:8080/"
		When I go to the website and let it load for "5" seconds
		Then the "webchat widget" should be "visible"

	Scenario: Close the widget box

		When I click the "CLOSE" button
		Then the "webchat widget box" should be "hidden"

	Scenario: Check widget persistence 

		Given that the client website is "http://localhost:8080/"
		When I go to the website and let it load for "5" seconds
		Then the "webchat widget box" should be "hidden"

	Scenario: Open the widget box

		When I click the "Talk to FundKo!" button
		Then the "webchat widget box" should be "visible"

	Scenario: Load pre-chat form

		Given that there are no pre-chat data stored in cookies
		Then the "webchat widget" should be "visible"
		And the "pre-chat form" should be "visible"

	Scenario: Test the pre-chat form

		When I click the "Start Chat!" button
		Then the error message "Name is required" will be displayed

		When I write "John Smith" for "Name" field
		And I click the "Start Chat!" button
		Then the error message "Email is required" will be displayed

		When I write "invalid-email" for "E-mail" field
		And I click the "Start Chat!" button
		Then the error message "Email is invalid" will be displayed

		When I write "john@smith.com" for "E-mail" field
		And I click the "Start Chat!" button
		Then the error message "Question is required" will be displayed

		When I write "1234" for "Phone" field
		And I click the "Start Chat!" button
		Then the error message "Question is required" will be displayed

		When I write "Can you help me?" for "Your Question" field
		And I click the "Start Chat!" button
		Then the "pre-chat form" should be "hidden"
		And my question "Can you help me?" will be sent to chatbox
		And the browser cookie should contain "John Smith", "john@smith.com", "1234" and "Can you help me?"
