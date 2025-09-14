import React from 'react';

export type SharedGridState = {
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}