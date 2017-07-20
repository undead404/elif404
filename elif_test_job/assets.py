from django_assets import Bundle, register
js = Bundle('js/jquery-2.2.3.js', 'js/tether.js', 'js/bootstrap.js', 'js/mdb.js',
            'js/vue.js', 'js/lodash.js', 'js/script.js', filters='jsmin', output='js/packed.js')
register('js_all', js)
css = Bundle('css/bootstrap.css', 'css/mdb.css', 'css/font-awesome.css',
             'css/mystyle.css', filters='cssmin', output='css/packed.css')
register('css_all', css)
