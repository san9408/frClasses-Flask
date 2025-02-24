import pandas as pd
from collections import defaultdict
from datetime import datetime

data =  [{'id': 2763, 'start_date': '2025-02-25T06:00:00', 'end_date': '2025-02-25T07:30:00', 'language': 'FR', 'location': 'REMOTE', 'location_name': 'S-102 - 816-423-8846', 'type': 'WORKSHOP', 'sub_type': 'FONETICA', 'teacher_name': 'Jennifer Andrea Lopez Rodríguez', 'books': ['Cosmopolite A1', 'Cosmopolite A2', 'Cosmopolite A3', 'Cosmopolite A1-1', 'Cosmopolite A2-1', 'Odyssée A1-1', 'Odyssée A2-1', 'Odyssée A1', 'Odyssée A2'], 'capacity': 10}, {'id': 2873, 'start_date': '2025-02-26T09:00:00', 'end_date': '2025-02-26T10:30:00', 'language': 'FR', 'location': 'REMOTE', 'location_name': 'S-117 - 565-235-2193', 'type': 'REGULAR', 'sub_type': '', 'teacher_name': 'Sol Camila Aldana Cordero', 'books': ['Cosmopolite A2', 'Odyssée A2'], 'capacity': 5}, {'id': 2716, 'start_date': '2025-02-24T09:00:00', 'end_date': '2025-02-24T10:30:00', 'language': 'FR', 'location': 'REMOTE', 'location_name': 'S-122 - 230-776-6037', 'type': 'REGULAR', 'sub_type': '', 'teacher_name': 'Natalia  Páez Ruíz', 'books': ['Cosmopolite A2', 'Odyssée A2'], 'capacity': 5}]

# Agrupación por fecha
grouped = defaultdict(list)

for item in data:
    date_key = item['start_date'].split('T')[0]  # Solo la fecha
    grouped[date_key].append(item)

# Transformación al formato deseado
result = [{'start_date': date, 'elements': elements} for date, elements in sorted(grouped.items())]

# Mostrar resultado
print(result)