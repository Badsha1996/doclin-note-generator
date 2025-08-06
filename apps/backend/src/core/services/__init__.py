'''
Service is also agnostic so we will not have actual DATABASE call but we can pretend to call it by calling 
agnostic repo class methods in CORE floder
this is actual core logic of the methods / controller 

IMPORTANT!
* This is an abstract service where you will pass SQL or Mongo REPO to this class to get actual implementaion
'''