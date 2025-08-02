import pandas as pd
import sqlite3

# Path file CSV lo
csv_file = 'laporanPenjualan2024.csv'

# Load CSV dengan delimiter ;
df = pd.read_csv(csv_file, delimiter=';')

# Bersihin kolom
df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
df['tanggal'] = pd.to_datetime(df['tanggal'], dayfirst=True, errors='coerce')

# Konversi amount ke float
df['amount'] = df['amount'].astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False)
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

# Isi qty default 1 kalau kosong
df['qty'] = pd.to_numeric(df.get('qty', 1), errors='coerce').fillna(1).astype(int)

# Drop baris yang tanggal/amount-nya null
df_clean = df.dropna(subset=['tanggal', 'amount'])

# Simpan ke SQLite
conn = sqlite3.connect('penjualan.db')
df_clean.to_sql('penjualan', conn, if_exists='replace', index=False)
conn.close()

print('✅ CSV berhasil diimport ke penjualan.db')
