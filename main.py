from math import gcd
from time import time

# Leaderboard list
leaderboard = []

def check_timer(start_time, time_limit):
    elapsed_time = time() - start_time
    remaining_time = time_limit - elapsed_time
    if remaining_time <= 0:
        print("\nTime's up! You exceeded the time limit. Game over!")
        exit()
    return remaining_time

def is_prime(num):
    """Check if a number is a prime."""
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

def stage1(start_time, time_limit, prime_range):
    while True:
        print("Stage 1: Prime Number Selection")
        remaining_time = check_timer(start_time, time_limit)  # Check time here
        print(f"Time left: {remaining_time:.2f} seconds")
        try:
            print(f"Select prime numbers in the range {prime_range[0]} to {prime_range[1]}")
            p = int(input("Enter a prime number p: "))
            q = int(input("Enter a prime number q: "))

            if not (prime_range[0] <= p <= prime_range[1]) or not (prime_range[0] <= q <= prime_range[1]):
                print("One or both numbers are out of range. Please try again.\n")
                continue

            if not is_prime(p) or not is_prime(q):
                print("One or both numbers are not prime. Please try again.\n")
                continue

            print(f"Selected primes: p = {p}, q = {q}")
            return p, q
        except ValueError:
            print("Invalid input. Please enter valid integers.\n")

def stage2(p, q, start_time, time_limit):
    print("\nStage 2: Key Generation")
    remaining_time = check_timer(start_time, time_limit)  # Check time here
    print(f"Time left: {remaining_time:.2f} seconds")
    condition = True
    time = 1
    n = p * q
    phi = (p - 1) * (q - 1)

    while True:
        e = int(input(f"Enter number e between 1 and {phi}: "))  
        if gcd(e, phi) == 1:
            break
        else:
            print("You selected the wrong e. Please select another value.")

    while condition:
        d = (phi * time) + 1  
        d = d / e
        if d.is_integer():
            condition = False
        time += 1 
    print(f"Public key: (e = {e}, n = {n})")
    return e, d, n

def encrypt(message, e, n):
    return [(ord(char) ** e) % n for char in message]

def stage3(e, n, start_time, time_limit):
    print("\nStage 3: Encryption")
    remaining_time = check_timer(start_time, time_limit)  # Check time here
    print(f"Time left: {remaining_time:.2f} seconds")
    message = input("Enter a plaintext to encrypt: ")
    ciphertext = encrypt(message, e, n)
    print(f"Encrypted message: {ciphertext}")
    return ciphertext

def decrypt(ciphertext, d, n):
    return ''.join([chr((char ** int(d)) % n) for char in ciphertext])

def stage4(ciphertext, d, n, start_time, time_limit):
    print("\nStage 4: Decryption")
    while True:
        remaining_time = check_timer(start_time, time_limit)  # Check time here
        print(f"Time left: {remaining_time:.2f} seconds")
        user_d = int(input("Enter your private key (d): "))
        user_decrypted_message = decrypt(ciphertext, user_d, n)
        decrypted_message = decrypt(ciphertext, d, n)
        
        if user_decrypted_message == decrypted_message:
            print(f"Congratulations! Your private key (d) is correct. Decrypted message: {user_decrypted_message}")
            break
        else:
            print(f"Decrypted message: {user_decrypted_message}\nThe private key (d) you entered is incorrect.\nPlease try again.\n")

def select_level():
    print("Select Level:")
    print("1. Easy (3 minutes, primes 1-999)")
    print("2. Medium (2 minutes, primes 1000-9999)")
    print("3. Hard (1 minute, primes 10,000-999,999)")
    while True:
        try:
            level = int(input("Enter your choice (1-3): "))
            if level == 1:
                return 180, (1, 999)
            elif level == 2:
                return 120, (1000, 9999)
            elif level == 3:
                return 60, (10000, 999999)
            else:
                print("Invalid choice. Please select 1, 2, or 3.")
        except ValueError:
            print("Invalid input. Please enter a number between 1 and 3.")

def show_leaderboard(user_time):
    global leaderboard
    leaderboard.append(user_time)
    leaderboard.sort()
    rank = leaderboard.index(user_time) + 1
    print("\nLeaderboard:")
    for i, time in enumerate(leaderboard, start=1):
        print(f"{i}. {time:.2f} seconds")
    print(f"\nYour rank: {rank}")

def game():
    print("Welcome to the Interactive RSA Game!")
    time_limit, prime_range = select_level()
    start_time = time()

    p, q = stage1(start_time, time_limit, prime_range)
    e, d, n = stage2(p, q, start_time, time_limit)
    ciphertext = stage3(e, n, start_time, time_limit)
    stage4(ciphertext, d, n, start_time, time_limit)
    
    user_time = time() - start_time
    print(f"\nGame completed successfully in {user_time:.2f} seconds!")
    show_leaderboard(user_time)

if __name__ == "__main__":
    game()