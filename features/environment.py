from selenium import webdriver

def before_all(context):
    context.browsers = {
        #'phantomjs': webdriver.PhantomJS(),
        'firefox': webdriver.Firefox(executable_path=r'features/selenium/geckodriver',capabilities=webdriver.common.desired_capabilities.DesiredCapabilities.FIREFOX),
        #'chrome': webdriver.Chrome(executable_path=r'features/selenium/chromedriver'),
    }
    context.websites = {
        'fundko': {
            'url':'http://localhost:8080/',
            'prechatform': True
        },
        'mercer': {
            'url':'http://localhost:8080/mercer',
            'prechatform': False
        },
    }
    context.clients = []
    for website in context.websites:
        for browser in context.browsers:
            context.clients.append({
                'browser': browser,
                'website': website
                })
    context.filters = {}

def after_all(context):
    for browser in context.browsers:
    	context.browsers[browser].quit()

def before_feature(context, feature):	
    pass
