import time, json

from behave import given, when, then
from selenium.webdriver.common.keys import Keys


def switch_frame(br):
	br.switch_to.frame(br.find_element_by_id('pez-widget-iframe'))

def switch_back(br):
	br.switch_to.default_content()

@given('that the client website is "{url}"')
def step(context,url):
	context.server_url = url

@given('that there are no pre-chat data stored in cookies')
def step(context):
	for k in context.browsers:
		context.browsers[k].delete_all_cookies()

@when('I click the "{button_text}" button')
def step(context,button_text):
	for k in context.browsers:
		br = context.browsers[k]
		btnid = None
		in_frame = False
		if button_text == 'Start Chat!':
			btnid = 'pez-widget-form-button'
			in_frame = True
		elif button_text == 'Send':
			btnid = 'pez-widget-send-button'
			in_frame = True
		elif button_text[:8] == 'Talk to ':
			btnid = 'pez-widget-launcher-open'
		elif button_text == 'CLOSE':
			btnid = 'pez-widget-launcher-close'
		if btnid is not None:
			if in_frame:
				switch_frame(br)
			br.find_element_by_id(btnid).click()
			if in_frame:
				switch_back(br)
	time.sleep(5)

@when('I write "{value}" for "{field}" field')
def step(context,value,field):
	fields = {
		'First Name': 'pez-widget-form-first-name',
		'Last Name': 'pez-widget-form-last-name',
		'E-mail': 'pez-widget-form-email',
		'Phone': 'pez-widget-form-phone',
		'Your Question': 'pez-widget-form-question'
	}
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		br.find_element_by_id(fields[field]).send_keys(value)
		switch_back(br)

@when('I type "{text}" in the message box')
def step(context,text):
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		br.find_element_by_id('pez-widget-message').send_keys(text)
		br.find_element_by_id('pez-widget-send-button').click()
		switch_back(br)
	time.sleep(5)

@when('I go to the website and let it load for "{seconds}" seconds')
def step(context,seconds):
	for k in context.browsers:
		br = context.browsers[k]
		br.get(context.server_url)
	time.sleep(float(seconds))

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

@then('the chatbot will say "{text}"')
def step(context,text):
	check_last_message(context,text,'server')

@then('my question "{text}" will be sent to the chatbox')
@then('my message "{text}" will be sent to the chatbox')
def step(context,text):
	check_last_message(context,text,'user')

def check_last_message(context,text,sender):
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		message = get_message_container(br,sender)
		actual = message.text
		switch_back(br)
		if actual != text:
			print('Actual message: '+actual)
		assert actual == text

def get_message_container(br,sender):
	class_name = 'pez-widget-comment-container'
	messages = [msg for msg in br.find_elements_by_class_name(class_name)]
	assert len(messages) > 0
	idx = -1
	if sender == 'user':
		idx = -2
	container_class = messages[idx].get_attribute('class')
	right_message = class_name+'-'+sender in container_class
	if not right_message:
		print('Class for msg #'+str(idx)+': '+container_class)
	assert right_message
	return messages[idx]

@then('the browser cookie should contain "{first_name}", "{last_name}", "{email}", "{phone}" and "{question}"')
def step(context,first_name,last_name,email,phone,question):
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
				assert data['user-firstname'] == first_name
				assert data['user-lastname'] == last_name
				assert data['user-email'] == email
				assert data['user-phone'] == phone
				assert data['user-question'] == question
		assert found


@given('that the "{element}" is "{visibility}"')
@then('the "{element}" should be "{visibility}"')
def step(context,element,visibility):
	for k in context.browsers:
		br = context.browsers[k]
		displayed = False
		in_frame = False
		if element == 'webchat widget':
			elid = 'pez-widget-container'
		elif element == 'webchat widget box':
			elid = 'pez-widget-container-span'
		elif element == 'pre-chat form':
			elid = 'pez-widget-form'
			in_frame = True
		elif element == 'message box':
			elid = 'pez-widget-input-area'
			in_frame = True
		if in_frame:
			switch_frame(br)
		displayed = br.find_element_by_id(elid).get_attribute('style') == 'display: block;'
		if in_frame:
			switch_back(br)
		if visibility == 'visible':
			success = displayed
		else:
			success = not displayed
		if not success:
			print('browser: '+k)
		assert success

@then('after "{seconds}" seconds, I should see the "{display}" of "{url}" in "{sender}" message')
def step(context,seconds,display,url,sender):
	senders = {
		'my': 'user',
		"chatbot's": 'server'
	} 
	class_names = {
		'open-graph display': ['image','title','descp','url'],
		'image preview': ['image','url'],
		'embedded video': ['video','url']
	}
	assert sender in senders
	sender = senders[sender]
	time.sleep(float(seconds))
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		message = get_message_container(br,sender)
		for class_name in class_names[display]:
			assert message.find_element_by_class_name(class_name)
		switch_back(br)

@then('all the links in the "{display}" in "{sender}" message should point to "{url}" in new tab')
def step(context,display,url,sender):
	senders = {
		'my': 'user',
		"chatbot's": 'server'
	} 
	class_names = {
		'open-graph display': ['image','title','url'],
		'image preview': ['image','url'],
		'embedded video': ['url']
	}
	assert sender in senders
	sender = senders[sender]
	for k in context.browsers:
		br = context.browsers[k]
		switch_frame(br)
		message = get_message_container(br,sender)
		for class_name in class_names[display]:
			link = message.find_element_by_css_selector('.'+class_name+' a')
			assert link.get_attribute('href') == url
			assert link.get_attribute('target') == '_blank'
		switch_back(br)
