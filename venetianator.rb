require 'sinatra'
require 'sinatra/reloader' if development?
require 'json'

configure :development do
  @@USE_ASSET_SERVER = false # for now..
  @@ASSET_SERVER = "http://localhost:3002/assets"
end


configure :production do
  @@USE_ASSET_SERVER = false
  @@ASSET_SERVER = "cf_assets.heroku.com/assets"
end

get '/' do
  #redirect '/boot.html'
  @page_title = "booting.."

  erb :boot
end

# ASSETS SERVER #
get '/assets' do

  if params[:css]
    asset = 'public/css/' + params[:css] + ".css"
    return File.open(asset,'r').read, :type => :css
  end

  if params[:js]
    asset = 'public/js/' + params[:js] + ".js"
    return File.open(asset,'r').read
  end

  return "no asset"

end


get '/payloads' do

  puts "params:" + params.to_s
puts params[:verb]
  if params[:verb] == 'request_local_id'

    # 'routes' for internal assets - to move into a DB, obv.

      return body_wrap(erb :aggregator) if params[:noun] == 'aggregator'
      return body_wrap(erb :aggregator2) if params[:noun] == 'aggregator2'

      return body_wrap(erb :table) if params[:noun] == 'table'
  end

  if params[:verb] == "request_uri"

    puts "External query"
    begin
    body_wrap(open(params[:noun]).read)
    rescue
      return {
        'head' => {
          'status' => 404
        }
      }
    end

  end

  if params[:verb] == "request_uri_body"

    puts "External query"
    begin
    body_wrap(open(params[:noun]).read)
    rescue
      return {
        'head' => {
          'status' => 404
        }
      }
    end

  end

  #puts params
  # echo back for debugging

  return {
    'head' => {
      'status' => 404
    }
  }

end

# wraps a valid asyn JSON container around 'content'
# bonus feature: It adds a title setting test just
# for shits n gigs
def body_wrap content

  puts "Bodywrapping content: " + content.to_s

  cmds = Array.new

  cmds << {'verb' => 'set_content', 'noun' => content}
  # debug hack
  cmds << {'verb' => 'set_title', 'noun' => 'done.'}


  response = {
      'head' => {
        'status' => 200
      },
      'body' => cmds #{
        #'commands' => cmds,
        #'content' => content.gsub("\n","") #"[=----------------------=]")
      #}
  }.to_json

  puts "Response: " + response
  response

end

##################################
def include_css name
  if @@USE_ASSET_SERVER
    "<link rel=\"stylesheet\" href=\"#{@@ASSET_SERVER}?name=#{name}\" media=\"all\" type=\"text/css\" />"
  else
    "<link rel=\"stylesheet\" href=\"/css/#{name}.css\" media=\"all\" type=\"text/css\" />"

  end
end

def include_js name
  if @@USE_ASSET_SERVER
   "<script type=\"text/javascript\" src=\"#{@@ASSET_SERVER}?js=#{name}\"></script>"
 else
   "<script type=\"text/javascript\" src=\"/js/cf/#{name}.js
   \"></script>"
 end
end