import React from "react";

/**
 * See css in index.css.
 */
const Spinner: React.FC = () => {
    return (
        <div>
            <p>Loading...Please wait a moment!</p>
            <span class="material-symbols-outlined spinner">progress_activity</span>
        </div>
    );
};

export default Spinner;