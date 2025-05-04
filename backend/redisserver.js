const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: '0dhAB5oxBHm1WLHUwzIRTtKVe7PKjD1o',
    socket: {
        host: 'redis-19834.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 19834
    }
});

client.on('error', err => console.log('Redis Client Error', err));

async function run() {
    await client.connect();

    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log(result);  // >>> bar

    // It's a good practice to close the connection after you're done.
    await client.quit();
}

run().catch(err => console.error('Error running the Redis operations:', err));