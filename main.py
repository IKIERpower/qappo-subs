import sys
from pympler import asizeof

# Zad1
def misra_gries(stream, k):
    dict = {}
    for el in stream:
        if el in dict:
            dict[el] += 1
        elif len(dict) < k - 1:
           dict[el] = 1
        else:
            tmp = []
            for key in dict:
                dict[key] -= 1
                if dict[key] == 0:
                    tmp.append(key)
            for t in tmp:
                del dict[t]

    dict2 = {}
    for el in stream:
        if el in dict:
            if el in dict2:
                dict2[el] += 1
            else:
                dict2[el] = 1

    return dict2

# Zad2
test_dict = [1, 4, 5, 4, 4, 5, 4, 4]
k = 2
print(misra_gries(test_dict, k))

# Zad3
test_dict = [2,2,1,2,3,5,5,1,7,8]
k = 3
print(misra_gries(test_dict, k))

# Strumień: [2,2,1,2,3,5,5,1,7,8], n=10, k=3, próg n/k = 3.33
# Najczęstszy element czyli 2 wystepują 3 razy, a więc ponizej progu.
# Z tego powowdu algorytm nie zwraca 2, zamiast tego zwraca fałszywego kandydata, czyli 8.
# Dowód że algorytm nie gwarantuje znalezienia najczęstszego elementu

# Zad 4
file = sys.argv[1]
k = int(sys.argv[2])

def second_misra(file, k):
    dict = {}
    n = 0
    with open(file, "r") as f:
        for line in f:
            for word in line.split():
                n += 1
                if word in dict:
                    dict[word] += 1
                elif len(dict) < k - 1:
                    dict[word] = 1
                else:
                    tmp = []
                    for key in dict:
                        dict[key] -= 1
                        if dict[key] == 0:
                            tmp.append(key)
                    for t in tmp:
                        del dict[t]
    dict2 = {}
    with open(file, "r") as f:
        for line in f:
            for word in line.split():
                if word in dict:
                    if word in dict2:
                        dict2[word] += 1
                    else:
                        dict2[word] = 1
    num = n / k
    dict2 = {k: v for k, v in dict2.items() if v > num}
    print("Pamięć misra:", asizeof.asizeof(dict), "bajtów")
    return sorted(dict2.items(), key=lambda x: x[1], reverse=True)

print(second_misra(file, k))

# Zad5
def brute_force(file, k):
    n = 0
    dict = {}
    with open(file, "r") as f:
        for line in f:
            for word in line.split():
                n+=1
                if word not in dict:
                    dict[word] = 1
                else:
                    dict[word] += 1

    num = n / k
    dict2 = {k: v for k, v in dict.items() if v > num}
    print("Pamięć brute-force:", asizeof.asizeof(dict), "bajtów")
    return dict2

print(brute_force(file, k))

# Wynik:
# Pamięć misra: 10368 bajtów
# Pamięć brute-force: 3573680 bajtów
# Wniosek: Algorytm brute-force zuzywa znacznie wiecej pamieci
