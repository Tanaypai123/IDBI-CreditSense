import numpy as np
import pandas as pd
import string

def generate_ids(prefix, count):
    """Vectorized ID generation: PREFIX + 8 digit zero-padded number"""
    nums = np.arange(1, count + 1)
    return np.char.add(prefix, np.char.zfill(nums.astype(str), 8))

def generate_gstins(states_codes, pan_array):
    """Generates realistic looking GSTINs based on state code and PAN"""
    entities = np.random.choice(['1', '2', '3'], size=len(pan_array))
    z = np.full(len(pan_array), 'Z')
    checksum = np.random.choice(list(string.ascii_uppercase + string.digits), size=len(pan_array))
    
    # Convert arrays to strings for concatenation
    state_str = np.char.zfill(states_codes.astype(str), 2)
    
    gstins = np.char.add(state_str, pan_array)
    gstins = np.char.add(gstins, entities)
    gstins = np.char.add(gstins, z)
    gstins = np.char.add(gstins, checksum)
    return gstins

def generate_pans(count):
    """Generates realistic PANs: 5 letters, 4 numbers, 1 letter"""
    letters1 = np.random.choice(list(string.ascii_uppercase), size=(count, 5))
    letters1[:, 3] = 'P' # 'P' stands for Person/Proprietor, standard for many MSMEs
    nums = np.random.choice(list(string.digits), size=(count, 4))
    letters2 = np.random.choice(list(string.ascii_uppercase), size=(count, 1))
    
    arr1 = np.apply_along_axis(lambda x: ''.join(x), 1, letters1)
    arr2 = np.apply_along_axis(lambda x: ''.join(x), 1, nums)
    arr3 = np.apply_along_axis(lambda x: ''.join(x), 1, letters2)
    
    return np.char.add(np.char.add(arr1, arr2), arr3)

def generate_correlated_noise(base, volatility, size):
    """Generates random noise around a base array with given volatility"""
    return base * np.random.normal(1.0, volatility, size)