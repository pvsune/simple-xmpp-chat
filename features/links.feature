Feature: Links Processing

	Scenario: Send links

		When I type "http://pez.ai/" in the message box
		Then after "20" seconds, I should see the "open-graph display" of "http://pez.ai/" in "my" message
		And all the links in the "open-graph display" in "my" message should point to "http://pez.ai/" in new tab

		When I type "[sendmelink]" in the message box
		Then after "20" seconds, I should see the "open-graph display" of "http://pez.ai/" in "chatbot's" message
		And all the links in the "open-graph display" in "chatbot's" message should point to "http://pez.ai/" in new tab

	Scenario: Send image links

		When I type "http://pez.ai/wp-content/uploads/2015/12/pez-full.png" in the message box
		Then after "10" seconds, I should see the "image preview" of "http://pez.ai/wp-content/uploads/2015/12/pez-full.png" in "my" message
		And all the links in the "image preview" in "my" message should point to "http://pez.ai/wp-content/uploads/2015/12/pez-full.png" in new tab

		When I type "[sendmeimage]" in the message box
		Then after "10" seconds, I should see the "image preview" of "http://pez.ai/wp-content/uploads/2015/12/pez-full.png" in "chatbot's" message
		And all the links in the "image preview" in "chatbot's" message should point to "http://pez.ai/wp-content/uploads/2015/12/pez-full.png" in new tab

	Scenario: Send Youtube links

		When I type "https://www.youtube.com/watch?v=IYJjrvXSbnM" in the message box
		Then after "10" seconds, I should see the "embedded video" of "https://www.youtube.com/watch?v=IYJjrvXSbnM" in "my" message
		And all the links in the "embedded video" in "my" message should point to "https://www.youtube.com/watch?v=IYJjrvXSbnM" in new tab

		When I type "[sendmevideo]" in the message box
		Then after "10" seconds, I should see the "embedded video" of "https://www.youtube.com/watch?v=IYJjrvXSbnM" in "chatbot's" message
		And all the links in the "embedded video" in "chatbot's" message should point to "https://www.youtube.com/watch?v=IYJjrvXSbnM" in new tab
