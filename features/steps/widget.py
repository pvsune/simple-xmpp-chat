import time, json

from behave import given, when, then

@given('that the client name is "{client}"')
def step(context,client):
	context.client_name = client

@given('the client website is "{url}"')
def step(context,url):
	context.server_url = url

@given('that there are no pre-chat data stored in cookies')
def step(context):
	for k in context.browsers:
		br = context.browsers[k]
		cookies = br.get_cookies()
		for cookie in cookies:
			data = json.loads(cookie['value'])
			assert 'user-name' not in data

@when('I click the "{button_text}" button')
def step(context,button_text):
	for k in context.browsers:
		br = context.browsers[k]
		btnid = None
		if button_text == 'Start Chat!':
			btnid = 'pez-widget-form-button'
		elif button_text == 'Send':
			btnid = 'pez-widget-send-button'
		elif button_text == 'Talk to '+context.client_name+'!':
			btnid = 'pez-widget-launcher-open'
		elif button_text == 'CLOSE':
			btnid = 'pez-widget-launcher-close'
		if btnid is not None:
			switch_frame(br)
			br.find_element_by_id(btnid).click()
			switch_back(br)

@when('I write "{value}" for "{field}" field')
def step(context,value,field):
	fields = {
		'Name': 'pez-widget-form-name',
		'E-mail': 'pez-widget-form-email',
		'Phone': 'pez-widget-form-phone',
		'Your Question': 'pez-widget-form-question'
	}
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		br.find_element_by_id(fields[field]).send_keys(value)
		switch_back(br)

@then('the error message "{error_message}" will be displayed')
def step(context,error_message):
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		actual = br.find_element_by_id('pez-widget-form-error').text
		switch_back(br)
		if actual != error_message:
			print('Actual error message: '+actual)
		assert actual == error_message

@then('my question "{question}" will be sent to chatbox')
def step(context,question):
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		actual = br.find_element_by_css_selector('#pez-widget-messages .pez-widget-conversation-part:first-child .text').text
		switch_back(br)
		if actual != question:
			print('Actual message: '+actual)
		assert actual == question

@given('that the page is loaded for "{seconds}" seconds')
@when('page is loaded for "{seconds}" seconds')
def step(context,seconds):
	for k in context.browsers:
		br = context.browsers[k]
		br.get(context.server_url)
	time.sleep(float(seconds))

@then('the browser cookie should contain "{name}", "{email}", "{phone}" and "{question}"')
def step(context,name,email,phone,question):
	for k in context.browsers:
		br = context.browsers[k]
		domain = br.current_url.split('://')[1].split('/')[0].split(':')[0]
		cookies = br.get_cookies()
		assert len(cookies) > 0
		found = False
		for cookie in cookies:
			if cookie['name'] == 'pez-widget-data' and cookie['domain'] == domain:
				found = True
				data = json.loads(cookie['value'])
				assert data['user-name'] == name
				assert data['user-email'] == email
				assert data['user-phone'] == phone
				assert data['user-question'] == question
		assert found


@given('that the "{element}" is "{visibility}"')
@then('the "{element}" should be "{visibility}"')
def step(context,element,visibility):
	for k in context.browsers:
		br = context.browsers[k]
		if element == 'webchat widget':
			displayed = br.find_element_by_id('pez-widget-container').get_attribute('style') == 'display: block;'
			if visibility == 'visible':
				success = displayed
			else:
				success = not displayed
		elif element == 'pre-chat form':
			switch_frame(br)
			displayed = br.find_element_by_id('pez-widget-form').get_attribute('style') == 'display: block;'
			switch_back(br)
			if visibility == 'visible':
				success = displayed
			else:
				success = not displayed
		if not success:
			print('browser: '+k)
		assert success

def switch_frame(br):
	br.switch_to.frame(br.find_element_by_id('pez-widget-iframe'))

def switch_back(br):
	br.switch_to.default_content()
