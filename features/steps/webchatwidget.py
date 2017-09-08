import time

from behave import given, when, then


@when('page is loaded')
def step(context):
   for browser in context.browsers:
      context.browsers[browser].get('http://localhost:8080') #'http://35.188.25.143/')
   time.sleep(5)


@then('webchat widget should be visible')
def step(context):
   for browser in context.browsers:
      print(browser)
      assert context.browsers[browser].find_element_by_id('pez-widget-container').get_attribute('style') == 'display: block;'

