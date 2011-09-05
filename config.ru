require "rubygems"
#require "bundler"
#Bundler.require
require 'sinatra_template.rb'

set :environment, :development
disable :run

run Sinatra::Application