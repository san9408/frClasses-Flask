from flask import Flask, jsonify, render_template, request, send_from_directory, redirect, url_for, session
import requests
import json
import datetime
import pytz

app = Flask(__name__)

@app.route("/")
def render_index():
    return render_template("index.html")

@app.route("/log-in", methods=["POST"])
def log_in():

    date_formated = format_date()
    date_formated = date_formated['date_formated']

    url_get_class = f'https://back-spc.azurewebsites.net/api/v1/class?start_date={date_formated}&type=REGULAR'
    url_get_reserved_class = f'https://back-spc.azurewebsites.net/api/v1/class?start_date={date_formated}&type=REGISTERED'
    #Surl_get_class_details = f"https://back-spc.azurewebsites.net/api/v1/class/{class_id}/session"
    #https://us06web.zoom.us/my/salon115?pwd=V0lmWFRRL0R6Tm56QTdRUHNoMWI3QT09

    if request.is_json:
        data = request.get_json()
        userId = data.get("userId")
        token = log_in_token(userId)
        classes = get_classes(token, url_get_class, url_get_reserved_class)
        return jsonify(classes)
    else:
        return jsonify({"error": "Formato no válido, usa JSON"}), 415

@app.route("/reserve", methods=["POST"])
def reserve_class():
    data = request.get_json()
    class_id = data.get('classId')
    token = data.get('token')  

    if not class_id or not token:
        return jsonify({'error': 'Faltan datos'}), 400 
    
    url_reserve_class = f"https://back-spc.azurewebsites.net//api/v1/class/{class_id}/registration"
    put_reserve_class = requests.put(url_reserve_class, headers={'Authorization': 'Bearer ' + token})
    print(response_reserve_class)
    response_reserve_class = json.loads(put_reserve_class.text)
    
    #response_reserve_class = jsonify({'classs': 'scheduled'})

    return response_reserve_class
    
def log_in_token(user):
    url_get_token = 'https://back-spc.azurewebsites.net/api/v1/auth/login'
    url = url_get_token
    body = {"customer_id":f"FR{user}","password":f"{user}"}
    x = requests.post(url, json = body)
    response = json.loads(x.text)
    token = response['token']
    return token

def get_classes(token, class_url_availabe, class_url_reserved):

    print(class_url_availabe, class_url_reserved)

    classes = {'available':[], 'reserved':[]}
    get_class = requests.get(class_url_availabe, headers={'Authorization': 'Bearer ' + token})
    response_class = json.loads(get_class.text)
    get_class_reserved = requests.get(class_url_reserved, headers={'Authorization': 'Bearer ' + token})
    response_class_reserved = json.loads(get_class_reserved.text)
    classes['available'] = response_class
    classes['reserved'] = response_class_reserved
    classes['token'] = token

    for class_item in classes['reserved']:
        details = get_class_details(class_item['id'], token)
        class_item['classDetails'] = details

    print(classes)
    return classes

def get_class_details(classId, token):
    url_get_class_details = f"https://back-spc.azurewebsites.net/api/v1/class/{classId}/session"
    get_class_reserved_details = requests.get(url_get_class_details, headers={'Authorization': 'Bearer ' + token})
    response_class_reserved_details = json.loads(get_class_reserved_details.text)
    return response_class_reserved_details

def format_date():
    time_zone = pytz.timezone("America/Bogota") # Europe/Paris 
    date_time_zone = datetime.datetime.now(time_zone)
    date_time_zone_extra_min = date_time_zone + datetime.timedelta(minutes=5)
    date_formated = f'{date_time_zone_extra_min.strftime('%Y-%m-%dT%H:%M:%S')}'
    date_beauty = f'{date_time_zone_extra_min.strftime('%a, %d %b %Y %H:%M')}'
    return {'date_beauty': date_beauty, 'date_formated': date_formated}