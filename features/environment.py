from selenium import webdriver

def before_all(context):
    context.browsers = {
        #'phantomjs': webdriver.PhantomJS(),
        'firefox': webdriver.Firefox(executable_path=r'features/selenium/geckodriver',capabilities=webdriver.common.desired_capabilities.DesiredCapabilities.FIREFOX),
        #'chrome': webdriver.Chrome(executable_path=r'features/selenium/chromedriver'),
    }

def after_all(context):
    for browser in context.browsers:
    	context.browsers[browser].quit()

def before_feature(context, feature):	
    pass
