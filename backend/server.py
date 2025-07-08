from flask import Flask, jsonify
import sqlite3
from markupsafe import escape
from flask_cors import CORS
from dotenv import load_dotenv
import re
import pandas as pd
import random

def clean_string(string):
    if pd.isna(string):
        return string
    
    string = re.sub(r"[^A-Za-z0-9]+", " ", string)
    string = string.upper()
    string = re.sub(r"\s\s+", " ", string)

    return string.strip()

app = Flask(__name__)
CORS(app)

app.config.update(
    DEBUG=False,      
    ENV="production", 
)

def get_results(query, params, cur):
    cur.execute(query, params)
    return [
        {cur.description[i][0]: val for i, val in enumerate(row)}
        for row in cur.fetchall()
    ]

def get_parcel_results(pattern, cur):
    return get_results("""
        select *
        from parcels
        where parcelpin like ? or
            par_addr_all_clean like ? or
            deeded_owner_clean like ? or 
            deeded_owner_main_alias like ? or
            parcelpin like ?
        order by total_violations desc, total_complaints desc, total_rentals desc
        limit 100
        """, 
        (pattern, pattern, pattern, pattern, pattern), 
        cur
    )

def get_owner_results(pattern, cur):
    return get_results("""
        select *
        from owners
        where deeded_owner_clean like ? or
            deeded_owner_main_alias like ?
        order by parcels_owned desc
        limit 100
        """, 
        (pattern, pattern), 
        cur
    )

def get_violation_results(pattern, cur):
    return get_results("""
        select *
        from violation_summary
        where record_id like ?
        order by file_date desc
        limit 100
        """, 
        (pattern,), 
        cur
    )

def get_complaint_results(pattern, cur):
    return get_results("""
        select *
        from complaint_summary
        where record_id like ?
        order by file_date desc
        limit 100
        """, 
        (pattern,), 
        cur
    )

def get_rental_results(pattern, cur):
    return get_results("""
        select *
        from rental_registrations
        where record_id like ?
        order by file_date desc
        limit 100
        """, 
        (pattern,), 
        cur
    )

@app.route("/owner/<q>")
def owner(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from owners
            where deeded_owner_clean = ? or
                deeded_owner_main_alias = ?
            order by parcels_owned desc
            limit 100
        """, (q, q))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/same_owner_parcels/<q>")
def same_owner_parcels(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from parcels
            where deeded_owner_clean = ? or
                deeded_owner_main_alias = ?
            order by transfer_date desc
            limit 100
        """, (q, q))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/same_owner_violations/<q>")
def same_owner_violations(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from violation_summary
            where deeded_owner_clean = ? or
                deeded_owner_main_alias = ?
            order by file_date desc
            limit 100
        """, (q, q))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/same_owner_complaints/<q>")
def same_owner_complaints(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from complaint_summary
            where deeded_owner_clean = ? or
                deeded_owner_main_alias = ?
            order by file_date desc
            limit 100
        """, (q, q))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/same_owner_rentals/<q>")
def same_owner_rentals(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from rental_registrations
            where deeded_owner_clean = ? or
                deeded_owner_main_alias = ?
            order by file_date desc
            limit 100
        """, (q, q))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results)

@app.route("/complaint_summaries_by_parcel/<q>")
def complaint_summaries_by_parcel(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from complaint_summary
            where parcelpin = ?
            order by file_date desc
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/rental_registrations_by_parcel/<q>")
def rental_registrations_by_parcel(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from rental_registrations
            where parcelpin = ?
            order by file_date desc
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/violation_summaries_by_parcel/<q>")
def violation_summaries_by_parcel(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from violation_summary
            where parcelpin = ?
            order by file_date desc
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/parcel_details/<q>")
def parcel_details(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from parcels
            where parcelpin = ?
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/complaint_details/<q>")
def complaint_details(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from complaint_history
            where record_id = ?
            order by task_date desc
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/violation_details/<q>")
def violation_details(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from violation_history
            where record_id = ?
            order by task_date desc
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/rental_details/<q>")
def rental_details(q):
    q = escape(q).strip()

    try:
        conn = sqlite3.Connection('data/database.db')
        cur = conn.cursor()
        cur.execute("""
            select *
            from rental_registrations
            where record_id = ?
            order by file_date desc
            limit 100
        """, (q,))

        results = [
            {cur.description[i][0]: val for i, val in enumerate(row)}
            for row in cur.fetchall()
        ]
    finally:
        conn.close()

    return jsonify(results), 200

@app.route("/search/<q>")
def search(q):
    q = escape(q)
    q = clean_string(q)
    q_pattern = f"%{q}%"

    conn = sqlite3.Connection('data/database.db')
    cur = conn.cursor()

    try:
        parcels = get_parcel_results(q_pattern, cur)
        owners = get_owner_results(q_pattern, cur)
        complaints = get_complaint_results(q_pattern, cur)
        violations = get_violation_results(q_pattern, cur)
        rentals = get_rental_results(q_pattern, cur)
    finally:
        conn.close()

    results = []
    while (parcels or owners or complaints or violations or rentals):
        inserting = random.choice(['parcel', 'owner', 'complaint', 'violation', 'rental_registration'])
        if parcels and inserting == 'parcel':
            results.append({'type': 'parcel', 'data': parcels.pop()})
        if owners and inserting == 'owner':
            results.append({'type': 'owner', 'data': owners.pop()})
        if complaints and inserting == 'complaint':
            results.append({'type': 'complaint', 'data': complaints.pop()})
        if violations and inserting == 'violation':
            results.append({'type': 'violation', 'data': violations.pop()})
        if rentals and inserting == 'rental_registration':
            results.append({'type': 'rental_registration', 'data': rentals.pop()})
    return jsonify(results[::-1]), 200