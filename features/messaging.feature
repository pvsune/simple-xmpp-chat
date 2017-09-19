Feature: Sending and receiving messages

	Scenario: Text message

		When I type "hello" in the message box
		Then my message "hello" will be sent to the chatbox
		And the chatbot will say "Thanks for sending hello"

		When I type "How are you?" in the message box
		Then my message "How are you?" will be sent to the chatbox
		And the chatbot will say "Thanks for sending How are you?"
