jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
  }));
  
  const fs = require('fs'); 
  const Server = require('./Server');
  
  describe('writeDatabase method', () => {
    let server;
  
    beforeEach(() => {
      fs.writeFileSync.mockClear();
      server = new Server(8080); 
      server.DATABASE_FILE = 'fake_database.json';
    });
  
    test('should call fs.writeFileSync with correct arguments', () => {
      const testData = { key: 'value' };
      server.writeDatabase(testData);
  
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        server.DATABASE_FILE,
        JSON.stringify(testData, null, 2),
        'utf8'
      );
    });
  });