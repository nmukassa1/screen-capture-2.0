import { useEffect } from 'react';
import Tick from '../assets/tick-vecotr.png';

function SuccessfullUpload() {
    useEffect(() => {
        const uploadConfirmation = document.getElementById('upload-confirmation');
        uploadConfirmation?.classList.add('opacity-0');

        const fadeIn = setTimeout(() => {
            uploadConfirmation?.classList.remove('opacity-0');
        }
        , 300);
        return () => {
            clearTimeout(fadeIn);
        }
    }, [])
    
    return ( 
        <div id='upload-confirmation' className="grid place-content-center transition-opacity ease-in duration-500">
            <div className="w-[200px] h-[200px] rounded-full bg-[#B3D8A8] flex items-center justify-center">
                <img src={Tick} alt="Tick" className='w-1/2' />
            </div>
        </div>
     );
}

export default SuccessfullUpload;