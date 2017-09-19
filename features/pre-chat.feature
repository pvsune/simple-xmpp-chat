Feature: Pre-chat feature on load

	Scenario: Load pre-chat form

		Given that the client website is "http://localhost:8080/"
		And that there are no pre-chat data stored in cookies
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

	Scenario: Fill up all the fields

		When I write "john@smith.com" for "E-mail" field
		And I write "1234" for "Phone" field
		And I write "Can you help me?" for "Your Question" field
		And I click the "Start Chat!" button
		Then the "pre-chat form" should be "hidden"
		And the "message box" should be "visible"
		And my question "Can you help me?" will be sent to the chatbox
		And the chatbot will say "Thanks for sending Can you help me?"
		And the browser cookie should contain "John", "Smith", "john@smith.com", "1234" and "Can you help me?"
