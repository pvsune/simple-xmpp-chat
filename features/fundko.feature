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

	Scenario: Test required fields

		When I click the "Start Chat!" button
		Then the error message "First Name is required" will be displayed

		When I write "John" for "First Name" field
		And I click the "Start Chat!" button
		Then the error message "Last Name is required" will be displayed

		When I write "Smith" for "Last Name" field
		And I click the "Start Chat!" button
		Then the "pre-chat form" should be "hidden"
		And the chatbot will say "Hi, how may I help you?"

	Scenario: Test invalid email

		Given that there are no pre-chat data stored in cookies
		And that the client website is "http://localhost:8080/"
		When I go to the website and let it load for "5" seconds
		And I write "John" for "First Name" field
		And I write "Smith" for "Last Name" field
		And I write "invalid-email" for "E-mail" field
		And I click the "Start Chat!" button
		Then the error message "Email is invalid" will be displayed

		When I write "john@smith.com" for "E-mail" field
		And I write "1234" for "Phone" field
		And I write "Can you help me?" for "Your Question" field
		And I click the "Start Chat!" button
		Then the "pre-chat form" should be "hidden"
		And my question "Can you help me?" will be sent to chatbox
		And the browser cookie should contain "John", "Smith", "john@smith.com", "1234" and "Can you help me?"
