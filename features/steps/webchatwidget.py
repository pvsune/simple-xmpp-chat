import time, json

from behave import given, when, then

@given('that the pre-chat form is "{is_required}"')
def step(context,is_required):
	if is_required == 'required':
		context.filters['prechatform'] = True

@given('that there are no pre-chat data stored in cookies')
def step(context):
	for client in context.clients:
		cookies = context.browsers[client['browser']].get_cookies()
		for cookie in cookies:
			data = json.loads(cookie['value'])
			assert 'user-name' not in data

@when('page is loaded')
def step(context):
	for client in context.clients:
		context.browsers[client['browser']].get(context.websites[client['website']]['url'])
	time.sleep(5)

@then('the "{element}" should be visible')
def step(context,element):
	for client in context.clients:
		if element == 'webchat widget':
			success = context.browsers[client['browser']].find_element_by_id('pez-widget-container').get_attribute('style') == 'display: block;'
		elif element == 'pre-chat form':
			if 'prechatform' in context.filters and context.websites[client['website']]['prechatform']:
				d = context.browsers[client['browser']]
				d.switch_to.frame(d.find_element_by_id('pez-widget-iframe'))
				success = d.find_element_by_id('pez-widget-form').get_attribute('style') == 'display: block;'
			else:
				success = True #bypass
		if not success:
			print('browser: '+client['browser']+', website: '+client['website'])
		assert success
