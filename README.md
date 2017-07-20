# elif404
## How do I open it?
[Elif404](https://elif404.herokuapp.com/).
## How do I launch it locally? 
Base requirements:
* Linux
* git
* Python3
Linux, of course.

Launch these commands to run elif404 locally:
```
git clone https://github.com/undead404/elif404.git
cd elif404
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
gunicorn elif_test_job.wsgi
```
In result, the application should be available at ```http://127.0.0.1:8000/``` with SQLite as default database.
