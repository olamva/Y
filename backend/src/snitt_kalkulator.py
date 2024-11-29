KARAKTERER = {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2,
    "E": 1,
}

MINE_KARAKTERER = (
    ("ITGK", "C", 7.5),
    ("MatteA", "A", 7.5),
    ("Webtek", "B", 7.5),
    ("Exphil", "Tatt opp igjen", 7.5),

    ("Diskmat", "C", 7.5),
    ("Objekt", "A", 7.5),
    ("MMI", "Godkjent", 7.5),
    ("KTN", "Tatt opp igjen", 7.5),
    ("Exphil", "E", 7.5),

    ("ITP", "B", 7.5),
    ("IØ2000", "D", 7.5),
    ("Algdat", "D", 7.5),
    ("Datdig", "D", 7.5),

    ("PU", "A", 7.5),
    ("Databaser", "B", 7.5),
    ("OS", "A", 7.5),
    ("Krypto", "B", 7.5),
    ("KTN", "D", 7.5),

    ("Intro til AI", "B", 7.5),
    # ("Etisk hacking", "A", 7.5),
    # ("Datadrevet", "A", 7.5),
    # ("Webdev", "A", 7.5),
    # ("ITGK", "A", 7.5),
)


sum_poeng = 0
sum_studiepoeng = 0
for _, bokstav, studiepoeng in MINE_KARAKTERER:
    if bokstav in KARAKTERER:
        sum_poeng += KARAKTERER[bokstav] * studiepoeng
        sum_studiepoeng += studiepoeng

avg = sum_poeng / sum_studiepoeng

print(f"Snittkarakter på {avg:.2f}")