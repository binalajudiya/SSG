import { createClient } from 'next-sanity';
import config from './sanity.config';

const sanityClient = createClient(config);

export default sanityClient;